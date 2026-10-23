# hns.bio — Platform URL Patterns

This guide lists common URL patterns for major platforms so you can add a platform link to an `hns.bio` TXT record.

**How to read the tables:**
- **URL pattern:** The full URL format on the platform.
- **Purpose:** What the URL points to.
- **TXT record value:** The value to enter in your TXT record, without the platform domain or a leading `/`.

Replace placeholders such as `USERNAME`, `VIDEO_ID`, and `CHANNEL_ID` with the actual identifier.

## Rumble

| URL pattern | Purpose | TXT record value |
| --- | --- | --- |
| `rumble.com/user/NAME` | User profile | `user/NAME` |
| `rumble.com/c/NAME` | Channel | `c/NAME` |
| `rumble.com/vVIDEOID` | Individual video | `vVIDEOID` |
| `rumble.com/vVIDEOID-TITLE.html` | Individual video with title | `vVIDEOID-TITLE.html` |
| `rumble.com/playlists/ID` | Playlist | `playlists/ID` |
| `rumble.com/search/all?q=QUERY` | Search results | `search/all?q=QUERY` |
| `rumble.com/register/REFERRAL` | Referral registration | `register/REFERRAL` |
| `rumble.com/account/...` | Account settings and management | `account/...` |

## YouTube

| URL pattern | Purpose | TXT record value |
| --- | --- | --- |
| `youtube.com/@USERNAME` | Handle-based channel | `@USERNAME` |
| `youtube.com/channel/CHANNEL_ID` | Channel identified by its unique ID | `channel/CHANNEL_ID` |
| `youtube.com/c/CUSTOMNAME` | Older custom channel URL | `c/CUSTOMNAME` |
| `youtube.com/user/USERNAME` | Legacy username-based channel | `user/USERNAME` |
| `youtube.com/watch?v=VIDEO_ID` | Individual video | `watch?v=VIDEO_ID` |
| `youtube.com/playlist?list=PLAYLIST_ID` | Playlist | `playlist?list=PLAYLIST_ID` |
| `youtube.com/feed/FEED_NAME` | Feed or content section | `feed/FEED_NAME` |

## TikTok

| URL pattern | Purpose | TXT record value |
| --- | --- | --- |
| `tiktok.com/@USERNAME` | User profile | `@USERNAME` |
| `tiktok.com/@USERNAME/video/VIDEO_ID` | Individual video | `@USERNAME/video/VIDEO_ID` |
| `tiktok.com/@USERNAME/photo/POST_ID` | Photo post | `@USERNAME/photo/POST_ID` |
| `tiktok.com/tag/HASHTAG` | Hashtag page | `tag/HASHTAG` |
| `tiktok.com/music/NAME-ID` | Music or sound page | `music/NAME-ID` |
| `tiktok.com/@USERNAME/live` | Creator's LIVE page | `@USERNAME/live` |

## Reddit

| URL pattern | Purpose | TXT record value |
| --- | --- | --- |
| `reddit.com/user/USERNAME` | User profile | `user/USERNAME` |
| `reddit.com/r/NAME` | Community homepage | `r/NAME` |
| `reddit.com/r/NAME/submit` | Create a post in a community | `r/NAME/submit` |
| `reddit.com/r/NAME/comments/POST_ID/TITLE` | Post and comments | `r/NAME/comments/POST_ID/TITLE` |
| `reddit.com/comments/POST_ID/TITLE` | Discussion thread | `comments/POST_ID/TITLE` |
| `reddit.com/search/?q=QUERY` | Search Reddit | `search/?q=QUERY` |
| `reddit.com/user/USERNAME/comments` | User's comment history | `user/USERNAME/comments` |
| `reddit.com/user/USERNAME/submitted` | User's submitted posts | `user/USERNAME/submitted` |
| `reddit.com/u/USERNAME` | Alternative user profile URL | `u/USERNAME` |
| `reddit.com/gallery/POST_ID` | Gallery-style post, where supported | `gallery/POST_ID` |

## Discord

| URL pattern | Purpose | TXT record value |
| --- | --- | --- |
| `discord.com/users/USER_ID` | User profile | `users/USER_ID` |
| `discord.gg/INVITE_CODE` | Server invite | `INVITE_CODE` |
| `discord.com/channels/SERVER_ID` | Server view | `channels/SERVER_ID` |
| `discord.com/channels/SERVER_ID/CHANNEL_ID` | Specific channel | `channels/SERVER_ID/CHANNEL_ID` |
| `discord.com/channels/SERVER_ID/CHANNEL_ID/MESSAGE_ID` | Specific message | `channels/SERVER_ID/CHANNEL_ID/MESSAGE_ID` |
| `discord.com/channels/@me/CHANNEL_ID` | Direct message or group DM | `channels/@me/CHANNEL_ID` |
| `discord.com/application-directory/APP_ID` | App or bot listing | `application-directory/APP_ID` |
| `discord.com/events/SERVER_ID/EVENT_ID` | Server event | `events/SERVER_ID/EVENT_ID` |

## Twitch

| URL pattern | Purpose | TXT record value |
| --- | --- | --- |
| `twitch.tv/USERNAME` | Main streamer channel | `USERNAME` |
| `twitch.tv/USERNAME/videos` | Recorded videos and other video content | `USERNAME/videos` |
| `twitch.tv/USERNAME/clips` | Clips associated with a channel | `USERNAME/clips` |
| `twitch.tv/USERNAME/clip/CLIP_SLUG` | A specific clip | `USERNAME/clip/CLIP_SLUG` |
| `twitch.tv/videos/VIDEO_ID` | A specific recorded video (VOD) | `videos/VIDEO_ID` |
| `twitch.tv/directory` | Browse streams and categories | `directory` |
| `twitch.tv/directory/category/CATEGORY` | Browse a specific category | `directory/category/CATEGORY` |
| `twitch.tv/directory/all` | Browse live streams | `directory/all` |
| `twitch.tv/downloads` | Downloads page; availability may vary | `downloads` |

## Medium

| URL pattern | Purpose | TXT record value |
| --- | --- | --- |
| `medium.com/@USERNAME` | Writer profile | `@USERNAME` |
| `USERNAME.medium.com` | Alternative profile URL | `USERNAME.medium.com` |
| `medium.com/PUBLICATION-NAME` | Publication homepage | `PUBLICATION-NAME` |
| `medium.com/tag/TOPIC` | Topic page | `tag/TOPIC` |
| `medium.com/@USERNAME/STORY-SLUG` | Article published under a writer's profile | `@USERNAME/STORY-SLUG` |
| `medium.com/PUBLICATION-NAME/STORY-SLUG` | Article published in a publication | `PUBLICATION-NAME/STORY-SLUG` |
| `medium.com/me` | Redirects a signed-in user to their profile | `me` |
| `medium.com/me/stories` | Manage stories when signed in | `me/stories` |

## SoundCloud

| URL pattern | Purpose | TXT record value |
| --- | --- | --- |
| `soundcloud.com/USERNAME` | Artist or user profile | `USERNAME` |
| `soundcloud.com/USERNAME/TRACK` | Individual track | `USERNAME/TRACK` |
| `soundcloud.com/USERNAME/sets/PLAYLIST` | Playlist or set | `USERNAME/sets/PLAYLIST` |
| `soundcloud.com/discover` | Discover audio | `discover` |
| `soundcloud.com/USERNAME/likes` | Liked tracks, where publicly available | `USERNAME/likes` |

## Spotify

| URL pattern | Purpose | TXT record value |
| --- | --- | --- |
| `open.spotify.com/user/USER_ID` | User profile, where available | `user/USER_ID` |
| `open.spotify.com/artist/ARTIST_ID` | Artist profile | `artist/ARTIST_ID` |
| `open.spotify.com/album/ALBUM_ID` | Album or release | `album/ALBUM_ID` |
| `open.spotify.com/track/TRACK_ID` | Individual song | `track/TRACK_ID` |
| `open.spotify.com/playlist/PLAYLIST_ID` | Playlist | `playlist/PLAYLIST_ID` |
| `open.spotify.com/show/SHOW_ID` | Podcast or show | `show/SHOW_ID` |
| `open.spotify.com/episode/EPISODE_ID` | Individual podcast episode | `episode/EPISODE_ID` |

## Patreon

| URL pattern | Purpose | TXT record value |
| --- | --- | --- |
| `patreon.com/CREATORNAME` | Creator's public page | `CREATORNAME` |
| `patreon.com/CREATORNAME/posts` | Creator's posts, where supported | `CREATORNAME/posts` |
| `patreon.com/posts/POST_ID` | Individual post | `posts/POST_ID` |
| `patreon.com/CREATORNAME/collections/COLLECTION_ID` | Collection of posts, where supported | `CREATORNAME/collections/COLLECTION_ID` |
| `patreon.com/user?fan_landing=true` | General member-facing landing page | `user?fan_landing=true` |

## WhatsApp

| URL pattern | Purpose | TXT record value |
| --- | --- | --- |
| `wa.me/PHONENUMBER` | Start a chat using a phone number | `PHONENUMBER` |
| `wa.me/USERNAME` | Username-based contact link, where supported | `USERNAME` |
| `wa.me/PHONENUMBER?text=MESSAGE` | Open a chat with a prefilled message | `PHONENUMBER?text=MESSAGE` |

## Telegram

| URL pattern | Purpose | TXT record value |
| --- | --- | --- |
| `t.me/USERNAME` | Open a chat with a public username | `USERNAME` |
| `USERNAME.t.me` | Alternative username link | `USERNAME.t.me` |
| `t.me/+PHONENUMBER` | Find or contact someone by phone number, subject to privacy settings | `+PHONENUMBER` |
| `t.me/CHANNELNAME` | Open a public channel | `CHANNELNAME` |
| `t.me/GROUPNAME` | Open a public group | `GROUPNAME` |
| `t.me/+INVITE_HASH` | Join a private group or channel using an invite link | `+INVITE_HASH` |
| `t.me/USERNAME/123` | Link to a specific post, where supported | `USERNAME/123` |

## TXT Record Checklist

- Use the **TXT record value** column for the value you enter.
- Do not include the platform domain in the TXT record value.
- Do not add a leading `/` to path-based values.
- Replace placeholders such as `USERNAME`, `VIDEO_ID`, and `CHANNEL_ID` with the real identifier.
- Do not include explanatory text such as “User profile” in the value.
- Some URL formats are legacy, optional, or only work in certain contexts.
- Check that the platform supports the URL format before using it.
