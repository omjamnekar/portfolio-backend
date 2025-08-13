# Blog API

This document describes the Blog section API, providing CRUD endpoints and public access for reading posts. All fields are optional (nullable) except the MongoDB-generated unique `id`. The `slug` is a URL-friendly identifier that is unique when provided. The API also supports `videoUrl`, `coverImage`, and `tags`.

## Data Model

- id: unique ID (MongoDB ObjectId)
- title: blog title
- slug: URL-friendly title (unique when present)
- excerpt: short summary
- content: full post content
- author: name of author
- createdAt: date of creation (auto)
- updatedAt: date of update (auto)
- tags: array of tags
- videoUrl: optional video URL
- coverImage: optional cover image URL

## Public Endpoints

- GET /api/blog
  - Query params: search, author, tag, tags (comma or repeated), sort, order, limit, offset
  - Returns paginated posts
- GET /api/blog/:idOrSlug
  - Returns a single post by id or slug

## Admin Endpoints (JWT required)

- POST /api/blog/admin
  - Create a post. Provide any subset of fields; slug is auto-generated from title if missing, and uniqued on collision.
- PATCH /api/blog/admin/:id
  - Update any fields partially
- DELETE /api/blog/admin/:id
  - Delete a post
- PATCH /api/blog/admin/bulk/update
  - Body: { ids: string[], updates: object }
- DELETE /api/blog/admin/bulk/delete
  - Body: { ids: string[] }

## Notes

- All fields are nullable/optional in the schema; only uniqueness on slug is enforced when provided.
- Tags are simple strings. Filter with `tag=one` or `tags=one,two`.
- Basic text search on title/excerpt/content via `search` query parameter.
