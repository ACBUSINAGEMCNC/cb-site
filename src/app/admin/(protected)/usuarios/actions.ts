"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function errorRedirect(message: string): never {
  redirect(`/admin/usuarios?error=${encodeURIComponent(message)}`);
}

function readPasswords(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("passwordConfirm") ?? "");
  if (password.length < 8) {
    errorRedirect("A senha precisa ter pelo menos 8 caracteres.");
  }
  if (password !== confirm) {
    errorRedirect("As senhas não conferem.");
  }
  return password;
}

export async function createUserAction(formData: FormData) {
  if (!(await requireAdminUser())) redirect("/admin/login");

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email || !email.includes("@")) {
    errorRedirect("Informe um e-mail válido.");
  }
  const password = readPasswords(formData);

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    errorRedirect(`Já existe um usuário com o e-mail ${email}.`);
  }

  await prisma.adminUser.create({
    data: { email, passwordHash: sha256(password) },
  });
  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios?created=1");
}

export async function updatePasswordAction(
  userId: number,
  formData: FormData
) {
  if (!(await requireAdminUser())) redirect("/admin/login");

  const user = await prisma.adminUser.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) errorRedirect("Usuário não encontrado.");

  const password = readPasswords(formData);
  await prisma.adminUser.update({
    where: { id: userId },
    data: { passwordHash: sha256(password) },
  });
  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios?password=1");
}

export async function deleteUserAction(userId: number) {
  const admin = await requireAdminUser();
  if (!admin) redirect("/admin/login");

  if (userId === admin.id) {
    errorRedirect("Você não pode excluir o próprio usuário.");
  }

  const total = await prisma.adminUser.count();
  if (total <= 1) {
    errorRedirect("Não é possível excluir o último usuário do painel.");
  }

  const user = await prisma.adminUser.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) errorRedirect("Usuário não encontrado.");

  await prisma.$transaction([
    prisma.adminSession.deleteMany({ where: { adminUserId: userId } }),
    prisma.adminUser.delete({ where: { id: userId } }),
  ]);
  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios?deleted=1");
}
