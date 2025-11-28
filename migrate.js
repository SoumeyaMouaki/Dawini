import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const {
  LOCAL_MONGODB_URI,
  ATLAS_MONGODB_URI,
  LOCAL_DB_NAME = 'dawini',
  REMOTE_DB_NAME = 'Dawini',
  COLLECTION_NAME = 'contact'
} = process.env

if (!LOCAL_MONGODB_URI || !ATLAS_MONGODB_URI) {
  console.error('❌ LOCAL_MONGODB_URI et/ou ATLAS_MONGODB_URI sont manquants dans votre fichier .env')
  process.exit(1)
}

async function migrateCollection() {
  let localClient
  let remoteClient

  try {
    console.log('🔌 Connexion à la base locale...')
    localClient = new MongoClient(LOCAL_MONGODB_URI)
    await localClient.connect()
    console.log('✅ Connecté à la base locale')

    console.log('🌐 Connexion à MongoDB Atlas...')
    remoteClient = new MongoClient(ATLAS_MONGODB_URI)
    await remoteClient.connect()
    console.log('✅ Connecté à MongoDB Atlas')

    const localDB = localClient.db(LOCAL_DB_NAME)
    const remoteDB = remoteClient.db(REMOTE_DB_NAME)

    const localCollection = localDB.collection(COLLECTION_NAME)
    const remoteCollection = remoteDB.collection(COLLECTION_NAME)

    console.log(`📥 Lecture des documents depuis ${LOCAL_DB_NAME}.${COLLECTION_NAME}...`)
    const documents = await localCollection.find({}).toArray()
    console.log(`➡️ ${documents.length} document(s) récupéré(s)`)

    if (documents.length === 0) {
      console.log('⚠️ Aucun document à migrer.')
      return
    }

    // Supprime les _id pour éviter les conflits lors de l'insertion
    const sanitizedDocuments = documents.map(({ _id, ...rest }) => rest)

    // Optionnel : nettoyer la collection distante avant insertion
    // console.log('🧹 Nettoyage de la collection distante existante...')
    // await remoteCollection.deleteMany({})

    console.log(`📤 Insertion dans ${REMOTE_DB_NAME}.${COLLECTION_NAME}...`)
    const insertResult = await remoteCollection.insertMany(sanitizedDocuments, { ordered: false })
    console.log(`✅ Migration terminée : ${insertResult.insertedCount} document(s) inséré(s)`)
  } catch (error) {
    console.error('❌ Erreur pendant la migration :', error)
    process.exitCode = 1
  } finally {
    if (localClient) {
      await localClient.close().catch(err => console.error('Erreur lors de la fermeture de la connexion locale :', err))
    }
    if (remoteClient) {
      await remoteClient.close().catch(err => console.error('Erreur lors de la fermeture de la connexion distante :', err))
    }
    console.log('🔒 Connexions fermées.')
  }
}

migrateCollection()

