import {
  Record,
  RecordBuilder,
  formatDescriptor,
  types,
} from "@condenast/cross-check-schema";
import { ISODate, Url } from "../support";

export const SimpleArticle: Record = Record("SimpleArticle", {
  fields: {
    hed: types.SingleLine().required(),
    dek: types.Text(),
    body: types.Text().required(),
  },
  metadata: {
    collectionName: "simple-articles",
    modelName: "simple-article",
  },
});

export const MediumArticle: Record = Record("MediumArticle", {
  fields: {
    hed: types.SingleLine().required("always"),
    dek: types.Text(),
    body: types.Text().required(),
    author: types.Dictionary({
      first: types.SingleLine(),
      last: types.SingleLine(),
    }),
    issueDate: ISODate(),
    canonicalUrl: Url(),
    tags: types.List(types.SingleWord()),
    categories: types.List(types.SingleLine()).required(),
    geo: types.Dictionary({
      lat: types.Integer().required(),
      long: types.Integer().required(),
    }),
    contributors: types.List(
      types.Dictionary({ first: types.SingleLine(), last: types.SingleLine() })
    ),
    relatedArticles: types.hasMany("MediumArticle"),
  },
  metadata: {
    collectionName: "medium-articles",
    modelName: "medium-article",
  },
});

export const Related: Record = Record("Related", {
  fields: {
    first: types.SingleLine(),
    last: types.Text(),

    person: types.hasOne("SimpleArticle").required(),
    articles: types.hasMany("MediumArticle"),
  },
  metadata: {
    collectionName: "related-articles",
    modelName: "related-article",
  },
});

export const Features: Record = Record("ArticleWithFlags", {
  fields: {
    hed: types.SingleLine(),
    dek: types.SingleLine(),
    categories: types.List(types.SingleLine()).features(["category-picker"]),
    description: types.Text().features(["description"]),
    location: types
      .Dictionary({
        lat: types.Float(),
        long: types.Float(),
      })
      .features(["map"]),
  },
  metadata: {
    collectionName: "articles-with-flags",
    modelName: "article-with-flags",
  },
});

export const Nesting: Record = Record("Nesting", {
  fields: {
    people: types
      .List(
        types.Dictionary({
          first: types.SingleLine(),
          last: types.Text(),
        })
      )
      .required(),
  },
});

const Records: { [key: string]: RecordBuilder } = {
  SimpleArticle,
  MediumArticle,
  Related,
  Features,
  Nesting,
};

export function resolve(name: string) {
  let record = Records[name];

  if (!record) return null;

  return {
    dictionary: record.members,
    metadata: record.metadata,
  };
}

// export const Cursor: () => Type = opaque(
//   "Cursor",
//   types.Text(),
//   "Cursor",
//   "Relay Cursor"
// );

// export const PageInfo = Record("PageInfo", {
//   hasNextPage: types.Boolean().required(),
//   hasPreviousPage: types.Boolean().required()
// });

// export const Edge: Generic = generic(T =>
//   Record("Edge", {
//     cursor: Cursor(),
//     node: T
//   })
// );

// export const Page = generic(T =>
//   Record("Page", {
//     // @ts-ignore
//     edges: Edge(T),
//     pageInfo: PageInfo
//   }).required()
// );

// export const Bundle = Record("Bundle", {
//   name: types.SingleLine(),
//   // @ts-ignore
//   articles: Page(SimpleArticle)
// });
