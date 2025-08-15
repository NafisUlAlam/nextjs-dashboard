"use server";

import { error } from "console";
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
  //console.log(date);
  try {
    await sql`insert into invoices (customer_id, amount, status, date) 
    values (${customerId}, ${amountInCents}, ${status}, ${date})`;
  } catch (error) {
    console.log(error);
  }
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formdata: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formdata.get("customerId"),
    amount: formdata.get("amount"),
    status: formdata.get("status"),
  });
  const amountInCents = amount * 100;
  await sql`update invoices
  set customer_id = ${customerId}, amount = ${amountInCents}, status =${status}
  where id=${id}`;
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  await sql`delete from invoices where id=${id}`;
  revalidatePath("/dashboard/invoices");
}
