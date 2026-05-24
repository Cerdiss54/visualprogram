import { store } from '@/store';
import { switchDocument } from '@/store/slices/documentsSlice';

export const loadDocumentById = async (documentId: string) => {
  return store.dispatch(switchDocument(documentId)).unwrap();
};