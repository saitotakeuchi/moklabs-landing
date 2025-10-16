import type { Collection } from '@tinacms/schema-tools';
import { type TinaCMS } from '@tinacms/toolkit';
import React from 'react';
import { type NavigateFunction } from 'react-router-dom';
import type { CollectionResponse, DocumentSys } from '../types';
export declare const handleNavigate: (navigate: NavigateFunction, cms: TinaCMS, collection: CollectionResponse, collectionDefinition: Collection<true>, document: DocumentSys) => Promise<any>;
declare const CollectionListPage: () => React.JSX.Element;
export default CollectionListPage;
