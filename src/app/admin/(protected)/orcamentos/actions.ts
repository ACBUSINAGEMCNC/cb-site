"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { QUOTE_STATUSES } from "@/lib/quoteStatus";

export async function updateQuoteStatusAction(formData: FormData) {
  if (!(await requireAdminUser())) redirect("/admin/login");

  const quoteId = Number(formData.get("quoteId"));
  const status = String(formData.get("status") ?? "");
  const isValidStatus = QUOTE_STATUSES.some((option) => option.value === status);
  if (!Number.isInteger(quoteId) || quoteId <= 0 || !isValidStatus) {
    redirect("/admin/orcamentos");
  }

  await prisma.quoteRequest.update({
    where: { id: quoteId },
    data: { status },
  });

  revalidatePath("/admin/orcamentos");
  revalidatePath(`/admin/orcamentos/${quoteId}`);
  revalidatePath("/admin");
  redirect(`/admin/orcamentos/${quoteId}?saved=1`);
}
