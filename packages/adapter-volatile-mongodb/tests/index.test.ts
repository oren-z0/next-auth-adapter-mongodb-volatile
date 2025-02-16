import { runBasicTests } from "@auth/adapter-test"
import { defaultCollections, format, VolatileMongoDBAdapter, _id } from "../src"
import { MongoClient } from "mongodb"

const name = "test"
// For the adapter-test:
const clientPromise = new MongoClient(
  `mongodb://localhost:27017/${name}`
).connect()
// For the VolatileMongoDBAdapter:
const createClient = async () => {
  const client = new MongoClient(`mongodb://localhost:27017/${name}`)
  await client.connect()
  return {
    client,
    close: () => client.close(),
  }
}

runBasicTests({
  adapter: VolatileMongoDBAdapter(createClient),
  db: {
    async disconnect() {
      const client = await clientPromise
      await client.db().dropDatabase()
      await client.close()
    },
    async user(id) {
      const client = await clientPromise
      const user = await client
        .db()
        .collection(defaultCollections.Users)
        .findOne({ _id: _id(id) })

      if (!user) return null
      return format.from(user)
    },
    async account(provider_providerAccountId) {
      const client = await clientPromise
      const account = await client
        .db()
        .collection(defaultCollections.Accounts)
        .findOne(provider_providerAccountId)
      if (!account) return null
      return format.from(account)
    },
    async session(sessionToken) {
      const client = await clientPromise
      const session = await client
        .db()
        .collection(defaultCollections.Sessions)
        .findOne({ sessionToken })
      if (!session) return null
      return format.from(session)
    },
    async verificationToken(identifier_token) {
      const client = await clientPromise
      const token = await client
        .db()
        .collection(defaultCollections.VerificationTokens)
        .findOne(identifier_token)
      if (!token) return null
      const { _id, ...rest } = token
      return rest
    },
  },
})
