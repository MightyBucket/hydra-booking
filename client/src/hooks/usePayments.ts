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

export function usePaymentLessons(paymentId: string) {
  return useQuery({
    queryKey: ["/api/payments", paymentId, "lessons"],
    queryFn: () => fetchPaymentLessons(paymentId),
    enabled: !!paymentId,
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