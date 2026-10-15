# Book artwork

Put the final book-template images here, with short unique filenames such as `book-001.jpg`.
Keep the complete artwork, including the title and author. Images are displayed uncropped.

Register each real item in `public/library/books.json`:

```json
[
  {
    "id": "book-001",
    "title": "Exact title from the artwork",
    "author": "Exact author from the artwork",
    "category": "التاريخ والسير",
    "image": "/library/books/book-001.jpg"
  }
]
```

Use a stable, unique ID for each title and a consistent category label. The catalogue validates
metadata, searches title and author (including normalized Arabic spellings/diacritics), generates
the category filters, and paginates by 12. Cards display only the supplied artwork; tapping opens
the full image. Metadata is also used for accessible image descriptions.

Every published entry represents an item in the physical Sahwa library's collection. There is
no borrowing, reservation, live inventory, or availability-status field. Remove an entry if it is
no longer part of the collection.

The initial manifest is intentionally empty because the supplied references contain no actual
book entries. The public page explains that book images are being added and still provides
the library introduction, address, and directions.
