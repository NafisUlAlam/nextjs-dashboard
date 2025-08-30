"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import postgres from "postgres";
import { z } from "zod";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({ invalid_type_error: "Select a customer" }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Amount must be greater than $0" }),
  date: z.string(),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Select an invoice status",
  }),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(prevState: State, formdata: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formdata.get("customerId"),
    amount: formdata.get("amount"),
    status: formdata.get("status"),
  });
  console.log(validatedFields.error?.flatten().fieldErrors);
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing fields, failed to create invoice",
    };
  }
  const { amount, customerId, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

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

export type updateErrorState = {
  errors: {
    customerId?: string[] | undefined;
    amount?: string[] | undefined;
    status?: string[] | undefined;
  };
};

export async function updateInvoice(
  id: string,
  prevState: updateErrorState,
  formdata: FormData
) {
  const value = UpdateInvoice.safeParse({
    customerId: formdata.get("customerId"),
    amount: formdata.get("amount"),
    status: formdata.get("status"),
  });

  if (!value.success) {
    return {
      errors: value.error.flatten().fieldErrors,
    };
  }
  const { amount, customerId, status } = value.data;
  const amountInCents = amount * 100;
  try {
    await sql`update invoices
    set customer_id = ${customerId}, amount = ${amountInCents}, status =${status}
    where id=${id}`;
  } catch (error) {
    console.log(error);
  }
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  await sql`delete from invoices where id=${id}`;
  revalidatePath("/dashboard/invoices");
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "invalid credentials";

        default:
          return "something went wrong";
      }
    }
    throw error;
  }
}
