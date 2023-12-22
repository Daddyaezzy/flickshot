// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { searchPostsQuery } from "../../../utils/queries";
import { client } from "../../../utils/client";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // res.status(200).json({name:"Successfully"})

  if (req.method === "GET") {
    const { searchTerm } = req.query;

    const videoQuery = searchPostsQuery(searchTerm);

    const videos = await client.fetch(videoQuery);

    res.status(200).json(videos);
  }
}
