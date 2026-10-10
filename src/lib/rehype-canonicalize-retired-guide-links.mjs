// Applies only to Markdown-authored *hyperlinks*. Public image paths and source
// articles stay byte-for-byte intact. This prevents internal 301 hops after an
// approved forensic consolidation, including links inside migrated archives.
import {publicGuideRedirects} from '../data/consolidated-redirects.mjs';
export default function canonicalizeRetiredGuideLinks(){
  return function transform(tree){
    const walk=(node)=>{
      if(node?.type==='element' && node.tagName==='a' && typeof node.properties?.href==='string'){
        const href=node.properties.href;
        const m=/^\/guides\/([a-z0-9-]+)\/?(?:[?#].*)?$/.exec(href);
        if(m && Object.hasOwn(publicGuideRedirects,m[1])){
          node.properties.href=publicGuideRedirects[m[1]]+'#'+m[1];
        }
      }
      if(Array.isArray(node?.children))for(const child of node.children)walk(child);
    };
    walk(tree);
  };
}
