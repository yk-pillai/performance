import fs from 'fs'
import { Pool } from "pg";
import {faker} from '@faker-js/faker'
import sharp from 'sharp';
import path from 'path';

// Setup PostgreSQL connection
const pool = new Pool({
  user: "yk",
  host: "localhost",
  database: "performance",
  password: "postgresql",
  port: 5432,
});

// Path to save images
const imagePathHero = path.join(__dirname, "..", "images", "hero");
const imagePathListing = path.join(__dirname, "..", "images", "listing");

// Ensure folders exist
fs.mkdirSync(imagePathHero, { recursive: true });
fs.mkdirSync(imagePathListing, { recursive: true });

// Generate data and save images
const generateData = async (numArticles = 1000) => {
  // Arrays to hold the data for COPY
  const articleData = [];
  const imageData = [];
  const viewData = [];
  const likeData = [];
  const sessionData = [];
  const articleTypeData = [];
  const { rows: types } = await pool.query(`select id from types`);

  // Get random tags
  const getRandomTags = (types, limit) => {
    const randomTags = new Set();
    for (let i = 0; i < limit; i++) {
      randomTags.add(types[Math.floor(Math.random() * types.length)].id);
    }
    return randomTags;
  };

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

    //Generate article type data
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

    await generateImage(heroImageName, imagePathHero, 1200, 600, title); // Hero image (1200x600)
    await generateImage(listingImageName, imagePathListing, 400, 300, title); // Listing image (400x300)

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

    // Generate session data for views and likes
    const sessCount = Math.ceil(Math.random() * 10);
    for (let i = 0; i < sessCount; i++) {
      const sessionId = faker.string.uuid();
      sessionData.push({
        id: sessionId,
      });
      // Add views and likes for this article (randomly choose sessions)
      viewData.push({
        article_id: articleId,
        session_id: sessionId,
      });
      // just to make likes lesser than views
      if (i % 2) {
        likeData.push({
          article_id: articleId,
          session_id: sessionId,
        });
      }
    }
  }

  // Perform bulk insertion using plain INSERT statements
  await insertData(
    articleData,
    imageData,
    viewData,
    likeData,
    sessionData,
    articleTypeData
  );
};

// Function to generate random image with specified width and height, and save to folder
const generateImage = async (imageName, folderPath, width, height, title) => {
  const image = sharp({
    create: {
      width: width,
      height: height,
      channels: 3,
      background: { r: 0, g: 0, b: 255 }, // Blue background
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
  sessionData,
  articleTypeData
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

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

    // Insert sessions
    for (const session of sessionData) {
      await client.query("INSERT INTO sessions (id) VALUES ($1)", [session.id]);
    }

    // Insert views
    for (const view of viewData) {
      await client.query(
        "INSERT INTO views (article_id, session_id) VALUES ($1, $2)",
        [view.article_id, view.session_id]
      );
    }

    // Insert likes
    for (const like of likeData) {
      await client.query(
        "INSERT INTO likes (article_id, session_id) VALUES ($1, $2)",
        [like.article_id, like.session_id]
      );
    }

    await client.query("COMMIT");
    console.log("Data inserted successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error in data insertion:", err.stack);
  } finally {
    client.release();
  }
};

// Run the data generation process
console.time("Script");
generateData()
  .then(() => {
    console.log("Dummy data generation completed");
  })
  .catch((err) => {
    console.error("Error generating dummy data:", err);
  });
console.timeEnd("Script");
