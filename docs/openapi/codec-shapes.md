# io-ts Codec Shapes Reference

Source: `src/internal/types/*.ts`. Conventions:
- `?` suffix = optional (in `t.partial` block).
- `| null` = nullable (`t.union([X, t.null])`).
- `| null | undefined` = `maybe(X)` helper (`t.union([X, t.null, t.undefined])`).
- `record<K,V>` = `t.record(K, V)`.
- `unknown` = `t.unknown` (opaque).

## SubstackFullPostCodec
- id: number (required)
- title: string (required)
- slug: string (required)
- post_date: string (required)
- canonical_url: string (required)
- subtitle?: string (optional)
- truncated_body_text?: string (optional)
- body_html?: string (optional)
- htmlBody?: string (optional)
- reactions?: record<string, number> (optional)
- reaction_count?: number (optional)
- restacks?: number (optional)
- postTags?: array of string (optional)
- cover_image?: string (optional)
- publishedBylines?: array of {SubstackBylineCodec} (optional)

## SubstackPreviewPostCodec
- id: number (required)
- title: string (required)
- post_date: string (required)
- subtitle?: string (optional)
- truncated_body_text?: string (optional)
- reaction_count?: number (optional)
- publishedBylines?: array of {SubstackBylineCodec} (optional)

## SubstackPublicationPostCodec
- id: number (required)
- title: string (required)
- slug: string (required)
- post_date: string (required)
- canonical_url: string (required)
- subtitle?: string | null (optional, nullable)
- cover_image?: string | null (optional, nullable)
- cover_image_is_square?: boolean (optional)
- audience?: string (optional)
- type?: string (optional)
- reactions?: record<string, number> (optional)
- restacks?: number (optional)
- section_id?: number | null (optional, nullable)
- section_name?: string | null (optional, nullable)
- section_slug?: string | null (optional, nullable)
- podcast_url?: string | null (optional, nullable)
- videoUpload?: unknown (optional)

## SubstackPublicationFullPostCodec
Extends `SubstackPublicationPostCodec` (intersection) with all of these optional fields:
- body_html?: string | null | undefined
- description?: string | null | undefined
- wordcount?: number | null | undefined
- meter_type?: string | null | undefined
- write_comment_permissions?: string | null | undefined
- postTags?: array of {SubstackPostTagCodec} | null | undefined
- podcastFields?: unknown | null | undefined
- voiceover_upload_id?: string | null | undefined
- voiceoverUpload?: unknown | null | undefined
- has_voiceover?: boolean | null | undefined
- editor_v2?: boolean | null | undefined
- publication_id?: number | null | undefined
- social_title?: string | null | undefined
- search_engine_title?: string | null | undefined
- search_engine_description?: string | null | undefined
- video_upload_id?: string | null | undefined
- podcast_upload_id?: string | null | undefined
- top_exclusions?: array of unknown | null | undefined
- pins?: array of unknown | null | undefined
- is_section_pinned?: boolean | null | undefined
- section_slug?: string | null | undefined
- section_name?: string | null | undefined
- should_send_free_preview?: boolean | null | undefined
- free_unlock_required?: boolean | null | undefined
- default_comment_sort?: string | null | undefined
- restacked_post_id?: number | null | undefined
- restacked_post_slug?: string | null | undefined
- restacked_pub_name?: string | null | undefined
- restacked_pub_logo_url?: string | null | undefined
- cover_image_is_square?: boolean | null | undefined
- cover_image_is_explicit?: boolean | null | undefined
- teaser_post_eligible?: boolean | null | undefined
- postCountryBlocks?: unknown | null | undefined
- headlineTest?: unknown | null | undefined
- coverImagePalette?: unknown | null | undefined
- reaction?: unknown | null | undefined
- is_geoblocked?: boolean | null | undefined
- hasCashtag?: boolean | null | undefined
- comment_count?: number | null | undefined
- child_comment_count?: number | null | undefined
- publishedBylines?: array of {SubstackBylineCodec} | null | undefined

### SubstackPostTagCodec (nested, used in publishedBylines)
- id: number (required)
- publication_id: number (required)
- name: string (required)
- slug: string (required)
- hidden: boolean (required)

## SubstackCommentCodec
- id: number (required)
- body: string (required)
- user_id?: number | null | undefined
- type?: string | null | undefined
- date?: string | null | undefined
- name?: string | null | undefined
- reaction_count?: number | null | undefined
- reactions?: record<string, number> | null | undefined
- restacks?: number | null | undefined
- restacked?: boolean | null | undefined
- children_count?: number | null | undefined
- body_json?: unknown | null | undefined
- publication_id?: number | null | undefined
- post_id?: number | null | undefined
- edited_at?: string | null | undefined
- ancestor_path?: string | null | undefined
- reply_minimum_role?: string | null | undefined
- media_clip_id?: string | null | undefined
- photo_url?: string | null | undefined
- bio?: string | null | undefined
- handle?: string | null | undefined
- user_bestseller_tier?: string | null | undefined
- attachments?: array of unknown | null | undefined
- userStatus?: unknown | null | undefined
- user_primary_publication?: unknown | null | undefined
- language?: string | null | undefined
- autotranslate_to?: string | null | undefined
- tracking_parameters?: record<string, unknown> | null | undefined
- author_is_admin?: boolean | null | undefined

## SubstackCommentResponseCodec
Wrapper from `/reader/comment/{id}`.
- item: object (required)
  - comment: object (required)
    - id: number (required)
    - body: string (required)
    - user_id: number (required)
    - name: string (required)
    - date: string (required)
    - post_id?: number | null (optional, nullable)
    - photo_url?: string (optional)

## SubstackCommentRepliesResponseCodec
- commentBranches: array of {SubstackCommentBranchCodec} (required)
- moreBranches: number (required)
- nextCursor: string | null (required, nullable)

### SubstackCommentBranchCodec (nested)
- comment: {SubstackReplyCommentCodec} (required)
- descendantComments: array of {SubstackReplyCommentCodec} (required)

### SubstackReplyCommentCodec (nested)
- id: number (required)
- body: string (required)
- date: string (required)
- name?: string (optional)
- photo_url?: string (optional)
- user_id?: number (optional)
- children_count?: number (optional)
- reaction_count?: number (optional)
- reactions?: record<string, number> (optional)
- restacks?: number (optional)
- restacked?: boolean (optional)
- ancestor_path?: string (optional)
- post_id?: number (optional)
- publication_id?: number (optional)
- edited_at?: string | null (optional, nullable)

## SubstackFullProfileCodec
- id: number (required)
- name: string (required)
- handle: string (required)
- photo_url: string (required)
- bio?: string | null | undefined
- tos_accepted_at?: string | null | undefined
- profile_disabled?: boolean | null | undefined
- publicationUsers?: array of {PublicationUserCodec} | null | undefined
- userLinks?: array of {UserLinkCodec} | null | undefined
- subscriptions?: array of {ProfileSubscriptionCodec} | null | undefined
- subscriptionsTruncated?: boolean | null | undefined
- hasGuestPost?: boolean | null | undefined
- primaryPublication?: {PrimaryPublicationCodec} | null | undefined
- max_pub_tier?: number | null | undefined
- hasActivity?: boolean | null | undefined
- hasLikes?: boolean | null | undefined
- lists?: array of unknown | null | undefined
- rough_num_free_subscribers_int?: number | null | undefined
- rough_num_free_subscribers?: string | null | undefined
- bestseller_badge_disabled?: boolean | null | undefined
- subscriberCountString?: string | null | undefined
- subscriberCount?: string | null | undefined
- subscriberCountNumber?: number | null | undefined
- hasHiddenPublicationUsers?: boolean | null | undefined
- visibleSubscriptionsCount?: number | null | undefined
- slug?: string | null | undefined
- previousSlug?: string | null | undefined
- primaryPublicationIsPledged?: boolean | null | undefined
- primaryPublicationSubscriptionState?: string | null | undefined
- isSubscribed?: boolean | null | undefined
- isFollowing?: boolean | null | undefined
- followsViewer?: boolean | null | undefined
- can_dm?: boolean | null | undefined
- dm_upgrade_options?: array of string | null | undefined

### PublicationUserCodec (nested, anonymous in full-profile.ts)
- id: number | null | undefined
- user_id: number | null | undefined
- publication_id: number | null | undefined
- role: string | null | undefined
- public: boolean | null | undefined
- is_primary: boolean | null | undefined
- publication: unknown

### UserLinkCodec (nested, anonymous in full-profile.ts)
- id: number | null | undefined
- user_id: number | null | undefined
- url: string | null | undefined
- title: string | null | undefined

### ProfileSubscriptionCodec (nested, anonymous in full-profile.ts)
- publication_id: number | null | undefined
- user_id: number | null | undefined
- created_at: string | null | undefined
- type: string | null | undefined

### PrimaryPublicationCodec (nested, anonymous in full-profile.ts)
- id: number | null | undefined
- name: string | null | undefined
- subdomain: string | null | undefined
- custom_domain?: string | null | undefined
- logo_url?: string | null | undefined
- author_id?: number | null | undefined
- handles_enabled?: boolean | null | undefined

## SubstackUserProfileCodec
Minimal feed wrapper for `/user/.../profile`.
- items: array of object (required)
  - context: {SubstackProfileItemContextCodec} (required)

### SubstackProfileItemContextCodec (nested)
- users: array of object (required)
  - id: number (required)
  - handle: string (required)

## SubstackProfileSearchResponseCodec
- results: array of {SubstackProfileSearchResultCodec} (required)
- more: boolean (required)

### SubstackProfileSearchResultCodec (nested)
- id: number (required)
- name: string (required)
- handle: string (required)
- bio?: string | null (optional, nullable)
- photo_url?: string | null (optional, nullable)
- followerCount?: number (optional)
- subscriberCount?: number (optional)
- hasPosts?: boolean (optional)
- slug?: string (optional)

## SubstackNoteCodec
- entity_key: string (required)
- context: {SubstackNoteContextCodec} (required)
- comment?: {SubstackNoteCommentCodec} (optional)
- parentComments?: array of {SubstackNoteCommentCodec} (optional)

### SubstackNoteContextCodec (nested)
- timestamp: string (required)
- users: array of {SubstackNoteUserCodec} (required)

### SubstackNoteUserCodec (nested)
- id: number (required)
- name: string (required)
- handle: string (required)
- photo_url: string (required)

### SubstackNoteCommentCodec (nested)
- id: number (required)
- body: string (required)
- reaction_count?: number (optional)

## SubstackInboxItemCodec
- post_id: number (required)
- type: string (required)
- title: string (required)
- web_url: string (required)
- content_key?: string (optional)
- updated_at?: string (optional)
- content_date?: string | null (optional, nullable)
- inbox_date?: string | null (optional, nullable)
- seen_at?: string | null (optional, nullable)
- saved_at?: string | null (optional, nullable)
- archived_at?: string | null (optional, nullable)
- skip_inbox?: boolean (optional)
- extra_views?: array of unknown (optional)
- subtitle?: string | null (optional, nullable)
- cover_photo_url?: string | null (optional, nullable)
- detail_view_subtitle?: string | null (optional, nullable)
- audience?: string (optional)
- postType?: string (optional)
- is_preview?: boolean (optional)
- video_id?: number | string | null (optional, nullable union)
- audio_url?: string | null (optional, nullable)
- audio_type?: string | null (optional, nullable)
- authors?: array of string (optional)
- published_bylines?: array of {InboxItemAuthorCodec} (optional)
- publication_id?: number | null (optional, nullable)
- publisher_name?: string | null (optional, nullable)
- publisher_image_url?: string | null (optional, nullable)
- like_count?: number | null (optional, nullable)
- comment_count?: number | null (optional, nullable)
- read_progress?: number (optional)
- max_read_progress?: number (optional)
- audio_progress?: number (optional)
- max_audio_progress?: number (optional)
- video_progress?: number (optional)
- max_video_progress?: number (optional)
- is_personal_mode?: boolean (optional)
- is_saved?: boolean (optional)
- created_at?: string (optional)
- uuid?: string (optional)
- coverImagePalette?: unknown (optional)
- duration_metadata?: object | null (optional, nullable)
  - word_count: number | null (required, nullable)
  - audio_duration: number | null (required, nullable)

### InboxItemAuthorCodec (nested, anonymous in inbox-item.ts)
- id: number (required)
- name: string (required)
- handle: string | null (required, nullable)
- photo_url: string (required)
- previous_name?: string | null (optional, nullable)
- bio?: string | null | undefined
- profile_set_up_at?: string | null (optional, nullable)
- reader_installed_at?: string | null (optional, nullable)
- publicationUsers?: array of unknown (optional)
- is_guest?: boolean (optional)
- bestseller_tier?: number | null (optional, nullable)
- status?: unknown (optional)

## SubstackCategoryCodec
- id: number | string (required, union)
- name: string (required)
- canonical_name: string (required)
- active: boolean (required)
- rank: number (required)
- slug: string (required)
- subcategories: array of {SubstackSubcategoryCodec} | null | undefined (required field but nullable)
- created_at?: string (optional)
- updated_at?: string (optional)
- parent_tag_id?: number | null (optional, nullable)
- emoji?: string | null (optional, nullable)
- leaderboard_description?: string | null (optional, nullable)
- deprecated?: boolean (optional)

### SubstackSubcategoryCodec (nested)
- id: number | string (required, union)
- name: string (required)
- canonical_name: string (required)
- active: boolean (required)
- rank: number (required)
- parent_tag_id: number | null (required, nullable)
- slug: string (required)
- created_at?: string (optional)
- updated_at?: string (optional)
- emoji?: string | null (optional, nullable)
- leaderboard_description?: string | null (optional, nullable)
- deprecated?: boolean (optional)

## SubstackCategoryPublicationCodec
- author_id: number (required)
- name: string (required)
- subdomain: string (required)
- logo_url: string | undefined (optional)
- cover_photo_url: string | undefined (optional)
- created_at: string | undefined (optional)
- custom_domain: string | null | undefined (optional, nullable)

## SubstackFacepileCodec
- reactors: array of {SubstackReactorCodec} (required)

### SubstackReactorCodec (nested)
- id: number (required)
- name: string (required)
- photo_url: string (required)

## SubstackLiveStreamResponseCodec
- activeLiveStream: {SubstackActiveLiveStreamCodec} | null (required, nullable)

### SubstackActiveLiveStreamCodec (nested)
- id: number (required)
- title: string (required)

## SubstackTrendingResponseCodec
- posts: array of {SubstackTrendingPostCodec} (required)
- publications: array of {SubstackTrendingPublicationCodec} (required)
- trendingPosts: array of unknown (required) — typed as `SubstackTrendingPostRef[]` interface in code

### SubstackTrendingPostCodec (nested)
- id: number (required)
- title: string (required)
- slug: string (required)
- post_date: string (required)
- type: string (required)
- audience?: string (optional)
- subtitle?: string (optional)
- canonical_url?: string (optional)
- reactions?: record<string, number> (optional)
- restacks?: number (optional)
- wordcount?: number (optional)
- comment_count?: number (optional)
- cover_image?: string (optional)
- publishedBylines?: array of {SubstackBylineCodec} (optional)

### SubstackTrendingPublicationCodec (nested)
- id: number (required)
- name: string (required)
- subdomain: string (required)
- logo_url?: string | null (optional, nullable)
- cover_photo_url?: string | null (optional, nullable)
- type?: string (optional)
- author_name?: string (optional)
- author_handle?: string (optional)
- has_posts?: boolean (optional)
- has_podcast?: boolean (optional)

### SubstackTrendingPostRef (interface, no codec)
- post_id?: number (optional)
- publication_id?: number | null (optional, nullable)
- primary_category?: string | null (optional, nullable)
- tag_id?: number | null (optional, nullable)

## PotentialHandlesCodec
- potentialHandles: array of {PotentialHandleCodec} (required)

### PotentialHandleCodec (nested)
- id: string (required)
- handle: string (required)
- type: HandleType (required) — literal union: `"existing" | "subdomain" | "suggestion"`

## PublishNoteResponseCodec
- id: number (required)
- date: string (required)
- body?: string (optional)
- attachments?: array of unknown (optional)

## CreateAttachmentResponseCodec
- id: string (required)

## SubscriberLists
- subscriberLists: array of {SubscriberList} (required)

### SubscriberList (nested, anonymous in subscriber-lists.ts)
- id: string (required)
- name: string (required)
- groups: array of {Group} (required)

### Group (nested, anonymous)
- users: array of {User} (required)

### User (nested, anonymous in subscriber-lists.ts — distinct from `SubstackUserCodec`)
- id: number (required)
- handle: string (required)

## SubstackBylineCodec
- id: number (required)
- name: string (required)
- handle: string (required)
- photo_url: string (required)

## SubstackUserCodec
- id: number (required)
- name: string (required)
- handle: string (required)
- photo_url: string (required)
- bio?: string (optional)

## Inferred shared subtypes

Reused named record/object shapes across codecs:

- **byline / minimal author** (id, name, handle, photo_url): `SubstackBylineCodec`, `SubstackNoteUserCodec`, `SubstackUserCodec` (adds optional `bio`), and the leading required fields of `InboxItemAuthorCodec`. Used in `publishedBylines` arrays of `SubstackFullPostCodec`, `SubstackPreviewPostCodec`, `SubstackPublicationFullPostCodec`, `SubstackTrendingPostCodec`, and inside `SubstackNoteContextCodec.users`.
- **reactions map**: `record<string, number>` (emoji or reaction key → count). Used by `SubstackFullPostCodec.reactions`, `SubstackPublicationPostCodec.reactions`, `SubstackTrendingPostCodec.reactions`, `SubstackCommentCodec.reactions`, `SubstackReplyCommentCodec.reactions`.
- **reactor / minimal user** (id, name, photo_url): `SubstackReactorCodec` (`SubstackFacepileCodec.reactors`).
- **handle-only user** (id, handle): used in `SubstackProfileItemContextCodec.users`, `SubstackUserProfileCodec.items[].context.users`, and `SubscriberLists.subscriberLists[].groups[].users`.
- **publication-light** (id, name, subdomain plus optional logo_url, custom_domain): `PrimaryPublicationCodec` (in full-profile), `SubstackTrendingPublicationCodec`, `SubstackCategoryPublicationCodec`, `SubstackPublicationCodec` (uses `hostname` instead of `id`).
- **publication-full** (`SubstackPublicationBaseCodec`): the full flattened publication shape (id, name, subdomain, custom_domain_optional, logo_url, author_id, user_id, handles_enabled, explicit, is_personal_mode, payments_state, pledges_enabled, optional custom_domain). Extended at the TS-interface level by `SubstackProfilePublication` (adds hero_text, primary_user_id, theme_var_background_pop, created_at, email_from_name, copyright, founding_plan_name, community_enabled, invite_only, language, homepage_type, author).
- **comment-base** (id, body, optional date/user_id/name/photo_url/reaction_count/reactions/restacks/restacked/children_count/edited_at/post_id/publication_id/ancestor_path): `SubstackCommentCodec`, `SubstackReplyCommentCodec`, and the inner `comment` object of `SubstackCommentResponseCodec`.
- **post-base** (id, title, slug, post_date, canonical_url, optional subtitle/cover_image/reactions/restacks/publishedBylines): shared identity across `SubstackFullPostCodec`, `SubstackPublicationPostCodec`, `SubstackPublicationFullPostCodec`, `SubstackTrendingPostCodec`. Differs in which fields are required vs optional and in nullability of `subtitle`/`cover_image`.
- **byline-with-status** (`InboxItemAuthorCodec`): byline fields plus optional `previous_name`, `bio`, `profile_set_up_at`, `reader_installed_at`, `publicationUsers`, `is_guest`, `bestseller_tier`, `status`. Currently used only inside `SubstackInboxItemCodec.published_bylines`.
- **handle type literal** (`HandleTypeCodec`): `"existing" | "subdomain" | "suggestion"` — used by `PotentialHandleCodec.type`.
- **maybe<T>** helper: `t.union([T, t.null, t.undefined])` from `helpers.ts`. Conventionally renders as nullable+optional in OpenAPI (`nullable: true` plus the field omitted from `required`).
- **post tag** (`SubstackPostTagCodec`): id, publication_id, name, slug, hidden — only in `SubstackPublicationFullPostCodec.postTags`.
- **duration metadata** (anonymous, in inbox-item.ts): `{ word_count: number|null, audio_duration: number|null } | null` — only on `SubstackInboxItemCodec.duration_metadata`.
- **link metadata** (`SubstackLinkMetadata` interface, no codec): url, host, title, optional description/image/original_image — referenced from `SubstackAttachment`.
- **attachment** (`SubstackAttachment` interface, no codec): id, type, optional imageUrl/imageWidth/imageHeight, explicit, optional linkMetadata.
- **theme** (`SubstackTheme` interface, no codec): optional background_pop_color, web_bg_color, cover_bg_color (nullable).
- **tracking parameters** (`SubstackTrackingParametersCodec`): standalone shape with required `item_*` and `impression_id` fields plus optional `item_comment_id`, `item_post_id`, `item_publication_id`, `item_source`. Not currently embedded in another codec via io-ts (but `SubstackCommentCodec.tracking_parameters` is a permissive `record<string, unknown>`).
