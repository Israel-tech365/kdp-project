import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Book, InsertBook } from "@shared/schema";

export function useBooks() {
  return useQuery<Book[]>({
    queryKey: ["/api/books"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useBook(id: string | undefined) {
  return useQuery<Book>({
    queryKey: ["/api/books", id],
    enabled: !!id,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (book: InsertBook) => {
      const response = await apiRequest("POST", "/api/books", book);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
    },
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertBook> }) => {
      const response = await apiRequest("PATCH", `/api/books/${id}`, data);
      return response.json();
    },
    onSuccess: (updatedBook) => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books", updatedBook.id] });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/books/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
    },
  });
}

export function useBookStats() {
  return useQuery({
    queryKey: ["/api/stats"],
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
