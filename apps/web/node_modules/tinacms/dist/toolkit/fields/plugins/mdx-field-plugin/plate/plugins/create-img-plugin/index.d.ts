import type { Media } from '../../../../../../core/media';
import { PlateEditor } from '@udecode/plate/react';
export declare const ELEMENT_IMG = "img";
declare const createImgPlugin: import("@udecode/plate/react").PlatePlugin<import("@udecode/plate").PluginConfig<"img", {}, {}, {}, {}>>;
export declare const insertImg: (editor: PlateEditor, media: Media) => void;
export default createImgPlugin;
