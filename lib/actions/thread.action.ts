"use server";

import { connectToDB } from "@/lib/mongoose";
import Thread from "@/lib/models/thread.modal";
import User from "@/lib/models/user.model";
import { revalidatePath } from "next/cache";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectToDB();

    const createThread = await Thread.create({
      text,
      author,
      community: null,
      path,
    });

    // Update User Modal
    await User.findByIdAndUpdate(author, {
      $push: { threads: createThread._id },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error creating thread: ${error.message}`);
  }
}

export async function featchPosts(pageNumber = 1, pageSize = 20) {
  connectToDB();

  //calculating the numner of posts to skip
  const skipAmount = (pageNumber - 1) * pageSize; // This will help work pagination search

  // Featch the post that have no parents (top-level threads..)
  const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: "author", model: User })
    .populate({
      path: "children",
      populate: {
        path: "author",
        model: User,
        select: "_id name parentId image",
      },
    });

  // Total post count
  const totalPostsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  });

  const posts = await postsQuery.exec();

  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
}

export async function fetchThreadById(id: string) {
  try {
    connectToDB();

    // Todo : Populate the community
    const thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (error: any) {
    throw new Error(`Error fetching thread: ${error.message}`);
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string,
) {
  try {
    connectToDB();

    // Adding a comment

    //Step 1: Find Original Thread by its ID
    const originalThread = await Thread.findById(threadId);

    // If we don't have a orginal thread
    if (!originalThread) {
      throw new Error("Thread not found");
    }

    // Create a new Thread with the commit Text
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    //Task: Save the new Thread
    const savedCommentThread = await commentThread.save();
    // Update the original thread to include the new comment
    originalThread.children.push(savedCommentThread._id);
    //Saving original thread
    await originalThread.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error adding coment to thread: ${error.message}`);
  }
}
