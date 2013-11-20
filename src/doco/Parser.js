/*
 Copyright 2013 Daniel Wirtz <dcode@dcode.io>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

var stream = require("stream");

/**
 * doco Parser.
 * @name doco.Parser
 * @constructor
 * @extends stream.Writable
 */
function Parser() {
    stream.Writable.call(this);

    /**
     * Buffer offset.
     * @type {number}
     */
    this.offset = 0;

    /**
     * Marked offset.
     * @type {number}
     */
    this.mark = 0;

    /**
     * Buffer limit.
     * @type {number}
     */
    this.limit = 0;

    /**
     * Buffer.
     * @type {Buffer}
     */
    this.buffer = null;

    /**
     * State.
     * @type {{SCAN: number, INCOMMENT: number, AFTERCOMMENT: number}}
     */
    this.state = Parser.State.SCAN;

    /**
     * Parsing stack.
     * @type {Array.<number>}
     */
    this.stack = [];
}

Parser.prototype = Object.create(stream.Writable.prototype);

/**
 * Initial buffer size. Defaults to 1mb.
 * @const {number}
 */
Parser.BUFFER_SIZE = 1024*1024;

/**
 * Parser states.
 * @const {{SCAN: number, INCOMMENT: number, AFTERCOMMENT: number}}
 */
Parser.State = {
    SCAN: 0,
    INCOMMENT: 1,
    AFTERCOMMENT: 2
};

/**
 * Writes some data to the parser.
 * @param {Buffer|string} chunk Chunk of data
 * @param {string} encoding Encoding if chunk is a string
 * @param {function()} callback Completion callback
 * @private
 */
Parser.prototype._write = function(chunk, encoding, callback) {
    if (this.buffer === null) {
        this.buffer = new Buffer(Parser.BUFFER_SIZE);
    }
    if (typeof chunk === 'string') {
        chunk = new Buffer(chunk, encoding);
    }
    if (this.limit + chunk.length > this.buffer.length) { // Buffer overflow
        // Would it fit if we move the data?
        if (this.limit - this.mark + chunk.length <= this.buffer.length) { // Yep
            this.buffer.copy(this.buffer, 0, this.mark, this.limit);
            this.limit -= this.mark;
            this.offset -= this.mark;
            this.mark = 0;
        } else { // Nope
            var size = this.buffer.length;
            while (this.limit - this.mark + chunk.length > size) {
                size *= 2;
            }
            var buffer = new Buffer(size);
            this.buffer.copy(buffer, 0, this.mark, this.limit);
            this.limit -= this.mark;
            this.offset -= this.mark;
            this.mark = 0;
            this.buffer = buffer;
        }
    }
    chunk.copy(this.buffer, this.limit, 0, chunk.length);
    this.limit += chunk.length;
    this._process();
    callback();
};

/**
 * Processes the next chunk of data.
 * @private
 */
Parser.prototype._process = function() {
    while (this.offset < this.limit) {
        switch (this.state) {
            case Parser.State.SCAN: // Look out for `/` + `*` + `*`
                for (;this.offset<this.limit; this.offset++) {
                    if (this.stack.length >= 2 && this.stack[this.stack.length-2] === 0x2F && this.stack[this.stack.length-1] === 0x2A && this.buffer[this.offset] == 0x2A) {
                        this.mark = this.offset+1;
                        this.state = Parser.State.INCOMMENT;
                        this.stack.length = 0;
                        break;
                    } else {
                        while (this.stack.length > 1) this.stack.shift();
                        this.stack.push(this.buffer[this.offset]);
                    }
                }
                break;
            case Parser.State.INCOMMENT: // Look out for `*` + `/`
                for (;this.offset<this.limit-1; this.offset++) {
                    if (this.stack.length >= 1 && this.stack[this.stack.length-1] === 0x2A && this.buffer[this.offset] === 0x2F) {
                        this._processComment(this.mark, this.offset-1);
                        this.mark = this.offset+1;
                        this.state = Parser.State.AFTERCOMMENT;
                        this.stack.length = 0;
                        break;
                    } else {
                        while (this.stack.length > 0) this.stack.shift();
                        this.stack.push(this.buffer[this.offset]);
                    }
                }
                break;
            case Parser.State.AFTERCOMMENT: // Look out for `{` or `;` and abort on '/'+'/' or '/'+'*'
                for (;this.offset<this.limit; this.offset++) {
                    if ((this.stack.length >= 1 && this.stack[this.stack.length-1] === 0x2F && (this.buffer[this.offset] === 0x2F || this.buffer[this.offset] === 0x2A))
                    ||  (this.buffer[this.offset] === 0x7B || this.buffer[this.offset] === 0x3B)) {
                        this._processDeclaration(this.mark, this.offset+1);
                        this.mark = this.offset+1;
                        this.state = Parser.State.SCAN;
                        this.stack.length = 0;
                        break;
                    } else {
                        while (this.stack.length > 1) this.stack.shift();
                        this.stack.push(this.buffer[this.offset]);
                    }
                }
                break;
            default:
                throw(new Error("[INTERNAL] Illegal parser state: "+this.state));
        }
    }
};

/**
 * Processes a comment.
 * @param {number} start
 * @param {number} end
 * @private
 */
Parser.prototype._processComment = function(start, end) {
    this.comment = this.buffer.toString("utf8", start, end); // Remember
};

/**
 * Processes a declaration (after a comment).
 * @param {number} start
 * @param {number} end
 * @private
 */
Parser.prototype._processDeclaration = function(start, end) {
    var decl = this.buffer.toString("utf8", start, end);
    this.emit("comment",
        this.comment.replace(/(?:^|\s+)\*+\s*/g, '\n').trim(),
        decl.replace(/\s+/g, ' ').trim()
    );
    this.comment = null;
};

module.exports = Parser;
