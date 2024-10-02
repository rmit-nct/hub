export interface StorageObject {
  id?: string;
  bucket_id?: string;
  name?: string;
  owner?: string;
  created_at?: string;
  updated_at?: string;
  last_accessed_at?: string;
  // metadata has eTag, size, mimeType, and other metadata
  metadata?: Record<string, any>;
  path_tokens?: string[];
  version?: string;
}
