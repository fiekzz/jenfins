// Polyfill for DOMParser in Cloudflare Workers
// AWS SDK requires DOMParser and Node to parse XML responses from S3

import { DOMParser as XMLDOMParser } from '@xmldom/xmldom'

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
    static DOCUMENT_POSITION_DISCONNECTED = 1
    static DOCUMENT_POSITION_PRECEDING = 2
    static DOCUMENT_POSITION_FOLLOWING = 4
    static DOCUMENT_POSITION_CONTAINS = 8
    static DOCUMENT_POSITION_CONTAINED_BY = 16
    static DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 32
}

// Use type assertion to bypass TypeScript checks
const g = globalThis as any

// Inject DOMParser and Node into global scope for AWS SDK
if (!g.DOMParser) {
    g.DOMParser = XMLDOMParser
}

if (!g.Node) {
    g.Node = MockNode
}
