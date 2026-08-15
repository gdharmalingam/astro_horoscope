"use client";

import { getSupabaseClient } from "@/lib/supabase";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const { data } = await getSupabaseClient().auth.getSession();
  if (data.session?.access_token) {
    headers.set("Authorization", `Bearer ${data.session.access_token}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`${res.status}: ${detail}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface BirthData {
  birth_datetime_local: string;
  timezone: string;
  latitude: number;
  longitude: number;
  ayanamsa?: string;
  dasa_depth?: number;
  name?: string;
  sex?: string;
  node?: string;
}

export interface GeoResult {
  display_name: string;
  latitude: number;
  longitude: number;
  timezone?: string | null;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  sex?: string | null;
  birth_datetime_local: string;
  timezone: string;
  latitude: number;
  longitude: number;
  place_name?: string | null;
  created_at: string;
}

export interface ProfileInput {
  name: string;
  sex?: string | null;
  birth_datetime_local: string;
  timezone: string;
  latitude: number;
  longitude: number;
  place_name?: string | null;
}

export const api = {
  me: () =>
    request<{
      id: string;
      email: string;
      display_name?: string;
      photo_url?: string;
      is_admin?: boolean;
    }>("/auth/me"),
  calculate: (data: BirthData) =>
    request<any>("/horoscopes/calculate", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  listApiKeys: () => request<any[]>("/api-keys"),
  createApiKey: (name: string) =>
    request<any>("/api-keys", { method: "POST", body: JSON.stringify({ name }) }),
  listProfiles: () => request<Profile[]>("/profiles"),
  createProfile: (data: ProfileInput) =>
    request<Profile>("/profiles", { method: "POST", body: JSON.stringify(data) }),
  deleteProfile: (id: string) =>
    request<void>(`/profiles/${id}`, { method: "DELETE" }),
  geoSearch: (q: string, limit = 5) =>
    request<GeoResult[]>(`/geo/search?q=${encodeURIComponent(q)}&limit=${limit}`),
  geoTimezone: (lat: number, lon: number) =>
    request<{ latitude: number; longitude: number; timezone?: string | null }>(
      `/geo/timezone?lat=${lat}&lon=${lon}`
    ),
  geoReverse: (lat: number, lon: number) =>
    request<GeoResult>(`/geo/reverse?lat=${lat}&lon=${lon}`),
  match: (boy: BirthData, girl: BirthData) =>
    request<any>("/horoscopes/match", {
      method: "POST",
      body: JSON.stringify({ boy, girl }),
    }),
  transit: (latitude: number, longitude: number) =>
    request<any>("/horoscopes/transit", {
      method: "POST",
      body: JSON.stringify({ latitude, longitude }),
    }),
};
