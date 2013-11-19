module.exports = function(doco) {

    var stream = require("stream");

    /**
     * Constructs a new Parser. Emits "comment" events for each comment it encounters.
     * @constructor
     * @extends stream.Writable
     */
    doco.Parser = function() {
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
        this.state = doco.Parser.State.SCAN;

        /**
         * Parsing stack.
         * @type {Array.<number>}
         */
        this.stack = [];
    };

    // Extends stream.Writable
    doco.Parser.prototype = Object.create(stream.Writable.prototype);

    /**
     * Initial buffer size. Defaults to 1mb.
     * @type {number}
     * @const
     */
    doco.Parser.BUFFER_SIZE = 1024*1024;

    /**
     * Parser states.
     * @type {{SCAN: number, INCOMMENT: number, AFTERCOMMENT: number}}
     * @const
     */
    doco.Parser.State = {
        SCAN: 0,
        INCOMMENT: 1,
        AFTERCOMMENT: 2
    };

    /**
     * Writes some data to the parser.
     * @param {Buffer} chunk
     * @param {string} encoding
     * @param {function()} callback
     * @private
     */
    doco.Parser.prototype._write = function(chunk, encoding, callback) {
        if (this.buffer === null) {
            this.buffer = new Buffer(doco.Parser.BUFFER_SIZE);
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
    doco.Parser.prototype._process = function() {
        while (this.offset < this.limit) {
            switch (this.state) {
                case doco.Parser.State.SCAN: // Look out for `/` + `*` + `*`
                    for (;this.offset<this.limit; this.offset++) {
                        if (this.stack.length >= 2 && this.stack[this.stack.length-2] == 0x2F && this.stack[this.stack.length-1] == 0x2A && this.buffer[this.offset] == 0x2A) {
                            this.mark = this.offset+1;
                            this.state = doco.Parser.State.INCOMMENT;
                            this.stack.length = 0;
                            break;
                        } else {
                            while (this.stack.length > 1) this.stack.shift();
                            this.stack.push(this.buffer[this.offset]);
                        }
                    }
                    break;
                case doco.Parser.State.INCOMMENT: // Look out for `*` + `/`
                    for (;this.offset<this.limit-1; this.offset++) {
                        if (this.stack.length >= 1 && this.stack[this.stack.length-1] == 0x2A && this.buffer[this.offset] == 0x2F) {
                            this._processComment(this.mark, this.offset-1);
                            this.mark = this.offset+1;
                            this.state = doco.Parser.State.AFTERCOMMENT;
                            this.stack.length = 0;
                            break;
                        } else {
                            while (this.stack.length > 0) this.stack.shift();
                            this.stack.push(this.buffer[this.offset]);
                        }
                    }
                    break;
                case doco.Parser.State.AFTERCOMMENT: // Look out for `{` or `;`
                    for (;this.offset<this.limit; this.offset++) {
                        if (this.buffer[this.offset] == 0x7B || this.buffer[this.offset] == 0x3B) {
                            this._processDeclaration(this.mark, this.offset+1); // Include the delimiter
                            this.mark = this.offset+1;
                            this.state = doco.Parser.State.SCAN;
                            break;
                        }
                    }
                    break;
                default:
                    throw(new Error("We should never end here."));
            }
        }
    };

    /**
     * Processes a comment.
     * @param {number} start
     * @param {number} end
     * @private
     */
    doco.Parser.prototype._processComment = function(start, end) {
        this.comment = this.buffer.toString("utf8", start, end); // Remember
    };

    /**
     * Processes a declaration (after a comment).
     * @param {number} start
     * @param {number} end
     * @private
     */
    doco.Parser.prototype._processDeclaration = function(start, end) {
        var decl = this.buffer.toString("utf8", start, end);
        this.emit("comment",
            this.comment.replace(/\s*[\*]+\s*/g, '\n').trim(),
            decl.replace(/\s+/g, ' ').trim()
        );
        this.comment = null;
    };
    
};
