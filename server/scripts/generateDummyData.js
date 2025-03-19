import fs from "fs";
import { faker } from "@faker-js/faker";
import sharp from "sharp";
import path, { dirname } from "path";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import pool from '../db'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to save images
const imagePathHero = path.join(__dirname, "..", "images", "hero");
const imagePathListing = path.join(__dirname, "..", "images", "listing");

// Ensure folders exist
fs.mkdirSync(imagePathHero, { recursive: true });
fs.mkdirSync(imagePathListing, { recursive: true });

// Generate data and save images
const generateData = async (numArticles = 500) => {
  // Arrays to hold the data for COPY
  const articleData = [];
  const imageData = [];
  const viewData = [];
  const likeData = [];
  const articleTypeData = [];
  const userData = [];
  const users = [];
  const { rows: types } = await pool.query(`SELECT id FROM types`);

  // Get random tags
  const getRandomTags = (types, limit) => {
    const randomTags = new Set();
    for (let i = 0; i < limit; i++) {
      randomTags.add(types[Math.floor(Math.random() * types.length)].id);
    }
    return randomTags;
  };

  // Generate User Data
  for (let u = 0; u < 50; u++) {
    const password = "password"; //faker.internet.password();
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const userId = faker.string.uuid();
    users.push(userId);
    userData.push({
      id: userId,
      username: faker.internet.username(),
      email: faker.internet.email(),
      password_hash: hashedPassword, // Store the hashed password
    });
  }

  for (let i = 0; i < numArticles; i++) {
    const articleId = faker.string.uuid();
    const title = faker.lorem.words({ min: 2, max: 5 });
    const content = faker.lorem.paragraph(15);
    const summary = faker.lorem.sentences(3);

    // Add article data for COPY
    articleData.push({
      id: articleId,
      title,
      content,
      summary,
    });

    // Generate article type data
    const tags = getRandomTags(types, Math.ceil(Math.random() * 5));
    for (let tag of tags) {
      articleTypeData.push({
        article_id: articleId,
        type_id: tag,
      });
    }

    // Generate two images (hero and listing)
    const heroImageName = `hero_${articleId}.jpg`;
    const listingImageName = `listing_${articleId}.jpg`;

    // Generate random RGB color values
    const randomColor = {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256),
    };

    await generateImage(heroImageName, imagePathHero, 1200, 600, title, randomColor); // Hero image (1200x600)
    await generateImage(listingImageName, imagePathListing, 400, 300, title, randomColor); // Listing image (400x300)

    // Add image data for COPY
    imageData.push({
      id: faker.string.uuid(),
      article_id: articleId,
      image_url: `/images/hero/${heroImageName}`,
      image_type: "hero",
    });
    imageData.push({
      id: faker.string.uuid(),
      article_id: articleId,
      image_url: `/images/listing/${listingImageName}`,
      image_type: "listing",
    });

    // Generate view and like data (with user_id and client_uuid)
    const viewCount = Math.ceil(Math.random() * 10);
    const generatedViews = new Set(); // Track generated views

    for (let j = 0; j < viewCount; j++) {
      const user =
        Math.random() < 0.5 && users.length > 0
          ? users[Math.floor(Math.random() * users.length)]
          : null;
      const clientUuid = user === null ? faker.string.uuid() : null; // client_uuid only if user is null
      const viewKey = user
        ? `${articleId}-${user}`
        : `${articleId}-${clientUuid}`; // Create a unique key

      if (!generatedViews.has(viewKey)) {
        generatedViews.add(viewKey); // Add to the set
        viewData.push({
          article_id: articleId,
          user_id: user,
          client_uuid: clientUuid,
        });
        if (user !== null && j % 2 === 0) {
          likeData.push({
            article_id: articleId,
            user_id: user,
          });
        }
      }
    }
  }

  // Perform bulk insertion using plain INSERT statements
  await insertData(
    articleData,
    imageData,
    viewData,
    likeData,
    articleTypeData,
    userData
  );
};

// Function to generate random image with specified width and height, and save to folder
const generateImage = async (imageName, folderPath, width, height, title, randomColor) => {
  const image = sharp({
    create: {
      width: width,
      height: height,
      channels: 3,
      background: randomColor, // Use random color
    },
  });

  // Create an SVG with dynamic text size to ensure it fits within the image
  const svgText = `<svg width="${width}" height="${height}">
                    <text x="50%" y="50%" font-size="48" text-anchor="middle" fill="black" dy=".3em">${title}</text>
                  </svg>`;

  // Composite the SVG image onto the sharp-generated image
  await image
    .composite([
      {
        input: Buffer.from(svgText),
        gravity: "center",
      },
    ])
    .jpeg()
    .toFile(path.join(folderPath, imageName));
};

const insertData = async (
  articleData,
  imageData,
  viewData,
  likeData,
  articleTypeData,
  userData
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Insert Users
    for (const user of userData) {
      await client.query(
        "INSERT INTO users (id, username, email, password_hash) VALUES ($1, $2, $3, $4)",
        [user.id, user.username, user.email, user.password_hash]
      );
    }

    // Insert articles with unique timestamps
    let timestamp = new Date(); // Start with the current timestamp
    for (const article of articleData) {
      // Increment timestamp for each article to make it unique
      const articleTimestamp = new Date(timestamp);
      timestamp.setSeconds(timestamp.getSeconds() + 1); // Increment by 1 second (adjust as needed)

      await client.query(
        "INSERT INTO articles (id, title, content, summary, timestamp) VALUES ($1, $2, $3, $4, $5)",
        [
          article.id,
          article.title,
          article.content,
          article.summary,
          articleTimestamp.toISOString(),
        ]
      );
    }

    // Insert article types
    for (const type of articleTypeData) {
      await client.query(
        "INSERT INTO article_types (article_id, type_id) VALUES ($1, $2)",
        [type.article_id, type.type_id]
      );
    }

    // Insert images
    for (const image of imageData) {
      await client.query(
        "INSERT INTO images (id, article_id, image_url, image_type) VALUES ($1, $2, $3, $4)",
        [image.id, image.article_id, image.image_url, image.image_type]
      );
    }

    // Insert views
    for (const view of viewData) {
      await client.query(
        "INSERT INTO views (article_id, user_id, client_uuid) VALUES ($1, $2, $3)",
        [view.article_id, view.user_id, view.client_uuid]
      );
    }

    // Insert likes
    for (const like of likeData) {
      await client.query(
        "INSERT INTO likes (article_id, user_id) VALUES ($1, $2)",
        [like.article_id, like.user_id]
      );
    }

    await client.query("COMMIT");
    console.log("Data inserted successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error in data insertion:", err); // Complete error log
  } finally {
    client.release();
  }
};

console.time("Script");
generateData()
  .then(() => {
    console.log("Dummy data generation completed");
  })
  .catch((err) => {
    console.error("Error generating dummy data:", err);
  })
  .finally(() => {
    console.timeEnd("Script");
  });
