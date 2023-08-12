import * as z from "zod";

export const UserValidation = z.object({
  profile_photo: z.string().url().nonempty(),
  name: z
    .string()
    .min(3, { message: "minium 3 characters limit" })
    .max(30, { message: "Maxium 30 charaters limit" }),
  username: z.string().min(3).max(30),
  bio: z.string().min(3).max(1000),
});

/* 
export const UserValidation = z.object({
  profile_photo: z.string().url().nonempty(),
  name: z.string().min(3).max(30),
  username: z.string().min(3).max(30),
  bio: z.string().min(3).max(1000),
}); 
*/
