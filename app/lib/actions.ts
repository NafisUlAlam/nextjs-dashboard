"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import postgres from "postgres";
import { z } from "zod";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  date: z.string(),
  // In TypeScript, this is called a string union type.
  // It means that the "status" property can only be one of the two strings: 'pending' or 'paid'.
  status: z.enum(["pending", "paid"]),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formdata: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formdata.get("customerId"),
    amount: formdata.get("amount"),
    status: formdata.get("status"),
  });
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];
  console.log(date);
  await sql`insert into invoices (customer_id, amount, status, date) 
  values (${customerId}, ${amountInCents}, ${status}, ${date})`;
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}
