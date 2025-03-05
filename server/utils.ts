import pool from "./db";

interface LikeAndViews {
  likesCount: number;
  viewsCount: number;
}

export const getLikesAndViewsCount = async (
  user: any,
  id: string,
  req: any
): Promise<LikeAndViews> => {
  let likedBy;
  let columnName;
  if (user) {
    likedBy = user.user_id;
    columnName = "user_id";
  } else {
    likedBy = req.cookies.client_id;
    columnName = "client_uuid";
  }
  const likes = await pool.query(
    `SELECT COUNT(*) from likes WHERE article_id=$1 AND user_id=$2`,
    [id, likedBy]
  );
  const views = await pool.query(
    `SELECT COUNT(*) from views WHERE article_id=$1 AND ${columnName}=$2`,
    [id, likedBy]
  );
  return { likesCount: likes.rows[0].count, viewsCount: views.rows[0].count };
};

