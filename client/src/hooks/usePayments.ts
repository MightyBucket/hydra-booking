import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { InsertPayment, Payment } from "@shared/schema";

async function fetchPayments(): Promise<Payment[]> {
  const sessionId = localStorage.getItem("sessionId");
  const headers: HeadersInit = {};
  if (sessionId) {
    headers["Authorization"] = `Bearer ${sessionId}`;
  }

  const response = await fetch("/api/payments", {
    headers,
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch payments");
  }
  return response.json();
}

async function fetchStudentPayments(studentId: string): Promise<Payment[]> {
  const response = await fetch(`/api/student/${studentId}/payments`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch student payments");
  }
  return response.json();
}

async function fetchPaymentLessons(paymentId: string): Promise<string[]> {
  const sessionId = localStorage.getItem("sessionId");
  const headers: HeadersInit = {};
  if (sessionId) {
    headers["Authorization"] = `Bearer ${sessionId}`;
  }

  const response = await fetch(`/api/payments/${paymentId}/lessons`, {
    headers,
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch payment lessons");
  }
  return response.json();
}

async function createPayment(data: InsertPayment & { lessonIds: string[] }): Promise<Payment> {
  const sessionId = localStorage.getItem("sessionId");
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (sessionId) {
    headers["Authorization"] = `Bearer ${sessionId}`;
  }

  const response = await fetch("/api/payments", {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create payment");
  }
  return response.json();
}

async function updatePayment(id: string, data: Partial<InsertPayment> & { lessonIds?: string[] }): Promise<Payment> {
  const sessionId = localStorage.getItem("sessionId");
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (sessionId) {
    headers["Authorization"] = `Bearer ${sessionId}`;
  }

  const response = await fetch(`/api/payments/${id}`, {
    method: "PUT",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update payment");
  }
  return response.json();
}

async function deletePayment(id: string): Promise<void> {
  const sessionId = localStorage.getItem("sessionId");
  const headers: HeadersInit = {};
  if (sessionId) {
    headers["Authorization"] = `Bearer ${sessionId}`;
  }

  const response = await fetch(`/api/payments/${id}`, {
    method: "DELETE",
    headers,
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to delete payment");
  }
}

export function usePayments() {
  return useQuery({
    queryKey: ["/api/payments"],
    queryFn: fetchPayments,
  });
}

export function useStudentPayments(studentId: string) {
  return useQuery({
    queryKey: ["/api/student", studentId, "payments"],
    queryFn: () => fetchStudentPayments(studentId),
    enabled: !!studentId,
  });
}

export function usePaymentLessons(paymentId: string) {
  return useQuery({
    queryKey: ["/api/payments", paymentId, "lessons"],
    queryFn: () => fetchPaymentLessons(paymentId),
    enabled: !!paymentId,
  });
}

async function fetchStudentPaymentLessons(studentId: string, paymentId: string): Promise<string[]> {
  const response = await fetch(`/api/student/${studentId}/payments/${paymentId}/lessons`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch student payment lessons");
  }
  return response.json();
}

export function useStudentPaymentLessons(studentId: string, paymentId: string) {
  return useQuery({
    queryKey: ["/api/student", studentId, "payments", paymentId, "lessons"],
    queryFn: () => fetchStudentPaymentLessons(studentId, paymentId),
    enabled: !!studentId && !!paymentId,
  });
}

async function fetchParentPayments(parentId: string): Promise<Payment[]> {
  const response = await fetch(`/api/parent/${parentId}/payments`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch parent payments");
  }
  return response.json();
}

export function useParentPayments(parentId: string) {
  return useQuery({
    queryKey: ["/api/parent", parentId, "payments"],
    queryFn: () => fetchParentPayments(parentId),
    enabled: !!parentId,
  });
}

async function fetchParentPaymentLessons(parentId: string, paymentId: string): Promise<string[]> {
  const response = await fetch(`/api/parent/${parentId}/payments/${paymentId}/lessons`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch parent payment lessons");
  }
  return response.json();
}

export function useParentPaymentLessons(parentId: string, paymentId: string) {
  return useQuery({
    queryKey: ["/api/parent", parentId, "payments", paymentId, "lessons"],
    queryFn: () => fetchParentPaymentLessons(parentId, paymentId),
    enabled: !!parentId && !!paymentId,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/lessons"] });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/lessons"] });
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertPayment> & { lessonIds?: string[] } }) => 
      updatePayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/lessons"] });
    },
  });
}