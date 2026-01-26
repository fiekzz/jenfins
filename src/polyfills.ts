// Polyfill for DOMParser in Cloudflare Workers
// AWS SDK requires DOMParser and Node to parse XML responses from S3

import { DOMParser as XMLDOMParser, DOMImplementation } from '@xmldom/xmldom'

// Create a mock Node class with the constants that AWS SDK expects
class MockNode {
    static ELEMENT_NODE = 1
    static ATTRIBUTE_NODE = 2
    static TEXT_NODE = 3
    static CDATA_SECTION_NODE = 4
    static ENTITY_REFERENCE_NODE = 5
    static ENTITY_NODE = 6
    static PROCESSING_INSTRUCTION_NODE = 7
    static COMMENT_NODE = 8
    static DOCUMENT_NODE = 9
    static DOCUMENT_TYPE_NODE = 10
    static DOCUMENT_FRAGMENT_NODE = 11
    static NOTATION_NODE = 12
}

// Inject DOMParser and Node into global scope
if (typeof globalThis.DOMParser === 'undefined') {
    (globalThis as any).DOMParser = XMLDOMParser
}

if (typeof globalThis.Node === 'undefined') {
    (globalThis as any).Node = MockNode
}
