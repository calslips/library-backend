const { ApolloServer, gql } = require('apollo-server')
const mongoose = require('mongoose')

const Author = require('./models/author')
const Book = require('./models/book')
const { MONGODB_URI } = require('./config')

console.log('connecting to:', MONGODB_URI)
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
})
  .then(() =>
    console.log('connected to MongoDB'))
  .catch((error) =>
    console.log('error connecting to MongoDB:', error.message))

const typeDefs = gql`
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(
      author: String
      genre: String
    ): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }
`

const resolvers = {
  Author: {
    bookCount: (root) =>
      Book.collection.countDocuments({ author: { $in: [root._id] } })
  },
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: (root, args) => {
      if (args.author && args.genre) {
        let authorsBooks = books.filter((b) => b.author === args.author)
        return authorsBooks.filter((b) => b.genres.includes(args.genre))
      } else if (args.author) {
        return books.filter((b) => b.author === args.author)
      } else if (args.genre) {
        return books.filter((b) => b.genres.includes(args.genre))
      } else {
        return books
      }
    },
    allAuthors: () => Author.find({})
  },
  Mutation: {
    addBook: async (root, args) => {
      let author = await Author.findOne({ name: args.author })
      const newBook = async (newBookAuthor) => {
        const bookToAdd = new Book({ ...args, author })
        await bookToAdd.save()
        return bookToAdd
      }
      const newAuthor = async (newAuthorName) => {
        const authorToAdd = new Author({ name: newAuthorName })
        await authorToAdd.save()
        return authorToAdd
      }

      if (author) {
        return newBook(author)
      }
      author = await newAuthor(args.author)
      return newBook(author)
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name })

      if (!author) {
        return null
      }
      author.born = args.setBornTo
      await author.save()
      return author
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})