/*
 * Shared TXT loader for the three HNS.BIO pages.
 * data-fetch on <body> selects the page. Do not unify these paths —
 * each one resolves the name and reports errors differently:
 *   host   (index.html)  domain.hns.bio  → hostname before ".hns.bio"
 *   path   (sld.html)    hns.bio/domain  → first path segment, punycode kept for DNS
 *   search (search.html) the search box query
 */
(function () {
    var PAGE = document.body.getAttribute('data-fetch');
    if (PAGE !== 'host' && PAGE !== 'path' && PAGE !== 'search') {
        PAGE = document.getElementById('domain-input') ? 'search' : 'host';
    }

    var currentFavicon = null;

    function isValidInput(input) {
        if (!input || input.length > 100) return false;
        var dangerous = /[<>"']|javascript:|data:/i;
        return !dangerous.test(input);
    }

    function formatPhoneNumber(phone) {
        if (phone.startsWith('+')) {
            return phone;
        } else if (phone.startsWith('00')) {
            return '+' + phone.slice(2);
        } else if (/^\d/.test(phone)) {
            return '+' + phone;
        }
        return phone;
    }

    // Flexible prefix aliases (case-insensitive). Canonical keys are the short ones used in the switch.
    var keyAliases = {
        'sx': 'sx', 'simplex': 'sx',
        'sn': 'sn', 'signal': 'sn',
        'wa': 'wa', 'whatsapp': 'wa',
        'tg': 'tg', 'telegram': 'tg',
        'link': 'link', 'url': 'link',
        'pk': 'pk', 'pkdns': 'pk',
        'gh': 'gh', 'github': 'gh',
        'bsky': 'bsky', 'bluesky': 'bsky',
        'ig': 'ig', 'instagram': 'ig', 'insta': 'ig',
        'fb': 'fb', 'facebook': 'fb',
        'yt': 'yt', 'youtube': 'yt',
        'nostr': 'nostr'
    };

    function isBareNpub(record) {
        if (!record || typeof record !== 'string') return false;
        var s = record.trim().toLowerCase();
        return s.startsWith('npub1') && s.length === 63 && /^[a-z0-9]+$/.test(s);
    }

    function buildSignalUrl(raw) {
        if (typeof raw !== 'string') return null;
        var v = raw.trim();
        if (!v || v.length > 128) return null;

        // Phone number path (E.164)
        var phoneClean = v.replace(/[\s\-().]/g, '');
        if (/^\+?\d+$/.test(phoneClean)) {
            var digits = phoneClean.replace(/^\+/, '');
            if (digits.length < 1 || digits.length > 15) return null;
            if (digits[0] === '0') return null;
            var e164 = '+' + digits;
            return 'https://signal.me/#p/' + encodeURIComponent(e164);
        }

        // Encrypted username path (Base64URL-ish)
        if (!/^[A-Za-z0-9_-]+$/.test(v)) return null;
        if (v.length < 8 || v.length > 64) return null;
        if (!/[A-Za-z]/.test(v)) return null;

        return 'https://signal.me/#eu/' + encodeURIComponent(v);
    }

    function applyFaviconHref(faviconUrl) {
        var faviconLink = document.querySelector('link[rel="shortcut icon"]');
        if (!faviconLink) {
            faviconLink = document.createElement('link');
            faviconLink.rel = 'shortcut icon';
            faviconLink.type = 'image/x-icon';
            document.head.appendChild(faviconLink);
        }
        faviconLink.href = faviconUrl;
        if (PAGE === 'search') currentFavicon = faviconUrl;
    }

    // index.html / sld.html: fav: or fav= is read from the raw TXT value
    async function setDynamicFavicon(txtRecords) {
        if (!txtRecords) return;

        var faviconRecord = txtRecords.find(function (record) {
            return record.startsWith('fav:') || record.startsWith('fav=');
        });
        if (faviconRecord) {
            var sep = faviconRecord.indexOf(':') !== -1 ? ':' : '=';
            var faviconValue = faviconRecord.split(sep)[1];
            applyFaviconHref('https://' + faviconValue);
        }
    }

    // search.html calls setDynamicFavicon with an already built URL
    function setSearchFavicon(faviconUrl) {
        applyFaviconHref(faviconUrl);
    }

    async function setDynamicCSS(txtRecords) {
        if (!txtRecords) return;

        var cssRecord = txtRecords.find(function (record) {
            return record.startsWith('css:') || record.startsWith('css=');
        });
        if (cssRecord) {
            var sep = cssRecord.indexOf(':') !== -1 ? ':' : '=';
            var cssValue = cssRecord.split(sep)[1];
            var cssUrl = '/css/' + cssValue + '.css';

            var cssLink = document.querySelector('link[rel="stylesheet"]');
            if (!cssLink) {
                cssLink = document.createElement('link');
                cssLink.rel = 'stylesheet';
                document.head.appendChild(cssLink);
            }
            cssLink.href = cssUrl;
        }
    }

    async function fetchAndProcessTXTRecords(domain) {
        // Host pages never ran the input check. Path and search did.
        if (PAGE !== 'host') {
            if (!isValidInput(domain)) {
                console.error('Invalid domain input:', domain);
                return null;
            }
        }

        var url = 'https://api.web3dns.net/?name=' + domain + '&type=TXT';
        console.log('Fetch URL:', url);

        try {
            var response = await fetch(url, {
                method: 'GET',
                headers: { 'Accept': 'application/dns-json' }
            });

            if (!response.ok) {
                throw new Error('HTTP Error: ' + response.status + ' ' + response.statusText);
            }

            var data = await response.json();
            console.log('DNS Response:', data);

            if (data.Answer && data.Answer.length > 0) {
                return data.Answer
                    .filter(function (record) { return record.type === 16; })
                    .map(function (record) { return record.data.replace(/"/g, ''); });
            } else {
                console.error('No TXT records found in DNS response.');
                if (PAGE === 'search') {
                    alert('No TXT records found for this domain.');
                } else {
                    document.body.innerHTML = '<p>No TXT records found for this domain.</p><br><a style="color: #fff; text-decoration: none;" href="https://github.com/H4ckB4s3/hns-bio">Do you need help seting up your DID? Check the full documentation</a>';
                }
                return null;
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            if (PAGE === 'search') {
                alert('An error occurred while fetching TXT records: ' + error.message);
            } else {
                document.body.innerHTML = '<p>An error occurred while fetching TXT records: ' + error.message + '</p><br><a style="color: #fff; text-decoration: none;" href="https://github.com/H4ckB4s3/hns-bio">Do you need help seting up your DID? Check the full documentation</a>';
            }
            return null;
        }
    }

    function emptyCurrencies() {
        return {
            btc: null, ln: null, hns: null, eth: null, xmr: null, zec: null, bat: null,
            aave: null, ada: null, algo: null, apt: null, atom: null, avax: null,
            bch: null, bgb: null, bnb: null, chainlink: null, cro: null, dai: null,
            doge: null, dot: null, ena: null, etc: null, fil: null, gt: null,
            hbar: null, hype: null, icp: null, jup: null, kas: null, leo: null,
            ltc: null, mnt: null, near: null, okb: null, om: null, ondo: null,
            op: null, pepe: null, pi: null, pol: null, render: null, shib: null,
            sol: null, sui: null, tao: null, tia: null, ton: null, trx: null,
            uni: null, usdc: null, usde: null, usdt: null, vet: null, xlm: null, xrp: null
        };
    }

    function processTXTRecords(txtRecords) {
        var profileDiv = document.getElementById('profile');
        var linksDiv = document.getElementById('links');
        var currencyButtonsDiv = document.getElementById('currency-buttons');
        var bgSet = false;
        var currencies = emptyCurrencies();

        txtRecords.forEach(function (record) {
            // Support both colon (:) and equals (=) as separators.
            // Colon wins when both are present. Only the first separator is used,
            // matching the previous per-page scripts.
            // Also treat a bare npub (no separator) as a nostr record.
            var key, value;
            if (isBareNpub(record)) {
                key = 'nostr';
                value = record.trim();
            } else if (record.includes(':')) {
                var colonParts = record.split(':');
                key = colonParts[0];
                value = colonParts[1];
            } else if (record.includes('=')) {
                var eqParts = record.split('=');
                key = eqParts[0];
                value = eqParts[1];
            } else {
                if (PAGE !== 'search') {
                    console.warn('No valid separator found in record: ' + record);
                }
                return;
            }

            // Normalize aliases (case-insensitive)
            if (key) {
                key = key.toLowerCase();
                key = keyAliases[key] || key;
            }

            var formattedValue = value;
            if (key === 'tel') {
                formattedValue = formatPhoneNumber(value);
            }

            switch (key) {
                case 'pfp':
                    profileDiv.innerHTML = '<img src="https://' + value + '" alt="Profile Picture">';
                    break;
                case 'bg':
                    if (!bgSet) {
                        document.body.style.backgroundImage = 'url(https://' + value + ')';
                        bgSet = true;
                    }
                    break;
                case 'bgcolor':
                    if (!bgSet) {
                        document.body.style.backgroundColor = '#' + value;
                        // search.html also cleared any background image here
                        if (PAGE === 'search') {
                            document.body.style.backgroundImage = '';
                        }
                        bgSet = true;
                    }
                    break;
                case 'fav':
                    if (PAGE === 'search') {
                        // search parsed fav through the same colon split as every other key
                        setSearchFavicon('https://' + value);
                    } else {
                        console.warn('Unhandled record type: ' + key);
                    }
                    break;
                case 'tb':
                    if (PAGE === 'search') {
                        linksDiv.innerHTML += '<button class="link" onclick="copyToClipboard(\'' + value + '\')"><img src="img/tb.png" alt="Thunderbolt Icon"></button>';
                    } else {
                        linksDiv.innerHTML += '<button class="link" onclick="copyToClipboard(\'' + value + '\')"><img src="img/' + key + '.png" alt="' + key.toUpperCase() + ' Icon"></button>';
                    }
                    break;
                case 'onion':
                    linksDiv.innerHTML += '<a class="link" href="http://' + value + '" target="_blank"><img src="img/onion.png" alt="Onion Icon"></a>';
                    break;
                case 'x':
                    linksDiv.innerHTML += '<a class="link" href="https://x.com/' + value + '" target="_blank"><img src="img/x.png" alt="X Icon"></a>';
                    break;
                case 'tg':
                    linksDiv.innerHTML += '<a class="link" href="https://t.me/' + value + '" target="_blank"><img src="img/tg.png" alt="Telegram Icon"></a>';
                    break;
                case 'wa':
                    linksDiv.innerHTML += '<a class="link" href="https://wa.me/' + value + '" target="_blank"><img src="img/wa.png" alt="WhatsApp Icon"></a>';
                    break;
                case 'sn': {
                    var signalUrl = buildSignalUrl(value);
                    if (!signalUrl) {
                        // Fallback to previous behavior for unrecognized values
                        signalUrl = 'https://signal.me/#p/' + value;
                    }
                    linksDiv.innerHTML += '<a class="link" href="' + signalUrl + '" target="_blank"><img src="img/sn.png" alt="Signal Icon"></a>';
                    break;
                }
                case 'tel':
                    linksDiv.innerHTML += '<a class="link" href="tel:' + formattedValue + '" target="_blank"><img src="img/tel.png" alt="Phone Icon"></a>';
                    break;
                case 'mail':
                    linksDiv.innerHTML += '<a class="link" href="mailto:' + value + '" target="_blank"><img src="img/mail.png" alt="Mail Icon"></a>';
                    break;
                case 'gh':
                    linksDiv.innerHTML += '<a class="link" href="https://github.com/' + value + '" target="_blank"><img src="img/gh.png" alt="GitHub Icon"></a>';
                    break;
                case 'link':
                    linksDiv.innerHTML += '<a class="link" href="http://' + value + '" target="_blank"><img src="img/link.png" alt="Link Icon"></a>';
                    break;
                case 'ig':
                    linksDiv.innerHTML += '<a class="link" href="https://www.instagram.com/' + value + '/" target="_blank"><img src="img/ig.png" alt="Instagram Icon"></a>';
                    break;
                case 'fb':
                    linksDiv.innerHTML += '<a class="link" href="https://www.facebook.com/' + value + '" target="_blank"><img src="img/fb.png" alt="Facebook Icon"></a>';
                    break;
                case 'yt':
                    linksDiv.innerHTML += '<a class="link" href="https://www.youtube.com/' + value + '" target="_blank"><img src="img/yt.png" alt="Youtube Icon"></a>';
                    break;
                case 'rumble':
                    linksDiv.innerHTML += '<a class="link" href="https://rumble.com/user/' + value + '" target="_blank"><img src="img/rumble.png" alt="Rumble Icon"></a>';
                    break;
                case 'ens':
                    linksDiv.innerHTML += '<a class="link" href="http://' + value + '.limo" target="_blank"><img src="img/ens.png" alt="ENS Icon"></a>';
                    break;
                case 'ipfs':
                    linksDiv.innerHTML += '<a class="link" href="https://ipfs.io/ipfs/' + value + '" target="_blank"><img src="img/ipfs.png" alt="IPFS Icon"></a>';
                    break;
                case 'nostr':
                    linksDiv.innerHTML += '<a class="link" href="nostr:' + value + '" target="_blank"><img src="img/nostr.png" alt="Nostr Icon"></a>';
                    break;
                case 'pk':
                    linksDiv.innerHTML += '<a class="link" href="http://' + value + './" target="_blank"><img src="img/pkdns.png" alt="pkdns Icon"></a>';
                    break;
                case 'matrix':
                    linksDiv.innerHTML += '<a class="link" href="https://matrix.to/#/@' + value + ':matrix.org" target="_blank"><img src="img/matrix.png" alt="Matrix Icon"></a>';
                    break;
                case 'sx':
                    linksDiv.innerHTML += '<a class="link" href="https://' + value + '" target="_blank"><img src="img/simplex.png" alt="SimpleX Icon"></a>';
                    break;
                case 'bsky': {
                    var bskyURL = value.includes('.') ? 'https://bsky.app/profile/' + value : 'https://bsky.app/profile/' + value + '.bsky.social';
                    linksDiv.innerHTML += '<a class="link" href="' + bskyURL + '" target="_blank"><img src="img/bsky.png" alt="Bluesky Icon"></a>';
                    break;
                }
                case 'opensea':
                    linksDiv.innerHTML += '<a class="link" href="https://opensea.io/' + value + '" target="_blank"><img src="img/opensea.png" alt="OpenSea Icon"></a>';
                    break;
                case 'btc':
                case 'ln':
                case 'hns':
                case 'eth':
                case 'xmr':
                case 'zec':
                case 'bat':
                case 'aave':
                case 'ada':
                case 'algo':
                case 'apt':
                case 'atom':
                case 'avax':
                case 'bch':
                case 'bgb':
                case 'bnb':
                case 'chainlink':
                case 'cro':
                case 'dai':
                case 'doge':
                case 'dot':
                case 'ena':
                case 'etc':
                case 'fil':
                case 'gt':
                case 'hbar':
                case 'hype':
                case 'icp':
                case 'jup':
                case 'kas':
                case 'leo':
                case 'ltc':
                case 'mnt':
                case 'near':
                case 'okb':
                case 'om':
                case 'ondo':
                case 'op':
                case 'pepe':
                case 'pi':
                case 'pol':
                case 'render':
                case 'shib':
                case 'sol':
                case 'sui':
                case 'tao':
                case 'tia':
                case 'ton':
                case 'trx':
                case 'uni':
                case 'usdc':
                case 'usde':
                case 'usdt':
                case 'vet':
                case 'xlm':
                case 'xrp':
                    currencies[key] = '<button class="currency-button" onclick="copyToClipboard(\'' + value + '\')"><img src="img/' + key + '.png" alt="' + key.toUpperCase() + ' Icon"></button>';
                    break;
                default:
                    console.warn('Unhandled record type: ' + key);
            }
        });

        Object.values(currencies).forEach(function (button) {
            if (button) {
                currencyButtonsDiv.innerHTML += button;
            }
        });
    }

    function scheduleExternal(txtRecords) {
        txtRecords.forEach(function (record) {
            if (record.startsWith('ext:') || record.startsWith('ext=')) {
                var sep = record.indexOf(':') !== -1 ? ':' : '=';
                var externalDomain = record.split(sep)[1];
                fetchAndProcessTXTRecords(externalDomain).then(processTXTRecords);
            }
        });
    }

    function copyToClipboard(text) {
        if (PAGE !== 'host') {
            // Computed by sld.html and search.html. The sanitized string was never written.
            var sanitizedText = text.replace(/[^\x20-\x7E]/g, '');
            void sanitizedText;
        }
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(function () {
                alert('Copied to clipboard: ' + text);
            }).catch(function (err) {
                if (PAGE !== 'search') {
                    console.error('Clipboard API failed, using fallback: ', err);
                }
                fallbackCopyToClipboard(text);
            });
        } else {
            fallbackCopyToClipboard(text);
        }
    }

    function fallbackCopyToClipboard(text) {
        var textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        if (PAGE !== 'search') {
            textArea.focus();
        }
        textArea.select();

        try {
            document.execCommand('copy');
            alert('Copied to clipboard: ' + text);
        } catch (err) {
            console.error('Fallback: Copy failed', err);
        }

        document.body.removeChild(textArea);
    }

    async function fetchTXTRecords(domain) {
        if (PAGE === 'search') {
            document.title = domain;
            var searched = await fetchAndProcessTXTRecords(domain);
            if (searched) {
                processTXTRecords(searched);
                scheduleExternal(searched);
                document.getElementById('search-container').style.display = 'none';
                document.getElementById('theme-switcher').style.display = 'none';
                document.getElementById('content').style.display = 'flex';
            }
            return;
        }

        var dnsName;
        if (PAGE === 'path') {
            var path = window.location.pathname.substring(1);
            var rootDomain = decodeURIComponent(path.split('/')[0]);
            var dnsLookupDomain = rootDomain;

            if (rootDomain.startsWith('xn--')) {
                try {
                    rootDomain = punycode.toUnicode(rootDomain);
                } catch (e) {
                    // Keep as punycode if conversion fails
                }
            }

            document.title = rootDomain;
            dnsName = dnsLookupDomain;
        } else {
            var fullHostname = window.location.hostname;
            var hostDomain = '';

            if (fullHostname.includes('.profile')) {
                hostDomain = fullHostname.split('.profile')[0];
            } else {
                hostDomain = fullHostname;
            }

            document.title = hostDomain;
            dnsName = hostDomain;
        }

        var txtRecords = await fetchAndProcessTXTRecords(dnsName);

        if (txtRecords) {
            await setDynamicFavicon(txtRecords);
            await setDynamicCSS(txtRecords);
            processTXTRecords(txtRecords);
            scheduleExternal(txtRecords);
        }
    }

    window.copyToClipboard = copyToClipboard;

    if (PAGE === 'search') {
        var searchContainer = document.getElementById('search-container');
        var content = document.getElementById('content');
        var domainInput = document.getElementById('domain-input');
        var goButton = document.getElementById('go-button');
        var goBackButton = document.getElementById('go-back-button');
        var themeButton = document.getElementById('theme-button');
        var themeDropdown = document.getElementById('theme-dropdown');
        var themeSwitcher = document.getElementById('theme-switcher');
        var defaultFavicon = '/img/hns.ico';

        document.getElementById('current-year').textContent = new Date().getFullYear();

        function setTheme(theme) {
            if (theme === 'light') {
                document.body.classList.add('light-mode');
            } else {
                document.body.classList.remove('light-mode');
            }
            localStorage.setItem('theme', theme);
            updateThemeDropdown();
            themeDropdown.classList.remove('show');

            if (content.style.display === 'none') {
                document.body.style.backgroundColor = theme === 'light' ? '#fff' : '#121212';
            }
        }

        function updateThemeDropdown() {
            var currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
            var oppositeTheme = currentTheme === 'light' ? 'dark' : 'light';
            var oppositeThemeName = oppositeTheme === 'light' ? 'Light Mode' : 'Dark Mode';

            themeDropdown.innerHTML = '<div class="theme-option" data-theme="' + oppositeTheme + '">' + oppositeThemeName + '</div>';
        }

        function toggleThemeDropdown() {
            themeDropdown.classList.toggle('show');
        }

        var savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);

        themeButton.addEventListener('click', toggleThemeDropdown);

        themeDropdown.addEventListener('click', function (e) {
            if (e.target.classList.contains('theme-option')) {
                setTheme(e.target.dataset.theme);
            }
        });

        document.addEventListener('click', function (e) {
            if (!themeButton.contains(e.target) && !themeDropdown.contains(e.target)) {
                themeDropdown.classList.remove('show');
            }
        });

        function resetToDefaults() {
            setSearchFavicon(defaultFavicon);
            document.title = 'PROFILE | Decentralized profile';
            searchContainer.style.display = 'flex';
            themeSwitcher.style.display = 'block';
            content.style.display = 'none';
            document.body.style.backgroundImage = '';
            var isLightMode = document.body.classList.contains('light-mode');
            document.body.style.backgroundColor = isLightMode ? '#fff' : '#121212';
            document.getElementById('profile').innerHTML = '';
            document.getElementById('links').innerHTML = '';
            document.getElementById('currency-buttons').innerHTML = '';
            domainInput.value = '';
            domainInput.focus();
        }

        function handleSearch() {
            var domain = domainInput.value.trim();
            if (domain) {
                goButton.disabled = true;
                domainInput.disabled = true;
                fetchTXTRecords(domain).finally(function () {
                    goButton.disabled = false;
                    domainInput.disabled = false;
                });
            } else {
                alert('Please enter a domain.');
            }
        }

        goButton.addEventListener('click', handleSearch);
        domainInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (!goButton.disabled) handleSearch();
            }
        });
        goBackButton.addEventListener('click', resetToDefaults);

        document.addEventListener('keydown', function (e) {
            if (content.style.display === 'flex') {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    resetToDefaults();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    resetToDefaults();
                } else if (e.key === 'Enter') {
                    if (document.activeElement === goBackButton ||
                        document.activeElement === document.body ||
                        document.activeElement === null) {
                        e.preventDefault();
                        resetToDefaults();
                    }
                }
            }
        });

        goBackButton.setAttribute('tabindex', '0');
        goBackButton.title = 'Back (Esc, →, or Enter)';
        window.onpopstate = function () { resetToDefaults(); };

        window.setDynamicFavicon = setSearchFavicon;
        window.resetToDefaults = resetToDefaults;
        window.handleSearch = handleSearch;
        window.setTheme = setTheme;
        window.updateThemeDropdown = updateThemeDropdown;
        window.toggleThemeDropdown = toggleThemeDropdown;
        window.fetchTXTRecords = fetchTXTRecords;
        window.isValidInput = isValidInput;
        window.fetchAndProcessTXTRecords = fetchAndProcessTXTRecords;
        window.formatPhoneNumber = formatPhoneNumber;
        window.processTXTRecords = processTXTRecords;
        window.fallbackCopyToClipboard = fallbackCopyToClipboard;
    } else {
        window.setDynamicFavicon = setDynamicFavicon;
        window.setDynamicCSS = setDynamicCSS;
        window.fetchTXTRecords = fetchTXTRecords;
        window.fetchAndProcessTXTRecords = fetchAndProcessTXTRecords;
        window.formatPhoneNumber = formatPhoneNumber;
        window.processTXTRecords = processTXTRecords;
        window.fallbackCopyToClipboard = fallbackCopyToClipboard;
        if (PAGE === 'path') window.isValidInput = isValidInput;
        window.onload = fetchTXTRecords;
    }
})();
