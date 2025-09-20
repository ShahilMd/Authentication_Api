import {email, string, z} from "zod";


export const registerSchema = z.object({
  name:z.string().min(3,'name must be 3 characters long').max(30,'name can not be more than 30 characters'),
  email:z.string()
    .email('invalid email')
    .refine(val => val.endsWith('@gmail.com'),{
      message:'must be a valid gmail account',
    }),
    password:z.string().min(8,'password must be 8 characters long'),

})

export const loginSchema = z.object({
  email:z.string()
    .email('invalid email')
    .refine(val => val.endsWith('@gmail.com'),{
      message:'must be a valid gmail account',
    }),
    password:z.string().min(8,'password must be 8 characters long'),
})