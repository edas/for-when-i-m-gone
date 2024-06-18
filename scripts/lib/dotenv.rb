# Modified from https://github.com/bkeepers/dotenv/
#
# MIT License
#
# Permission is hereby granted, free of charge, to any person obtaining
# a copy of this software and associated documentation files (the
# "Software"), to deal in the Software without restriction, including
# without limitation the rights to use, copy, modify, merge, publish,
# distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so, subject to
# the following conditions:
#
# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
# LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
# WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

module Dotenv
  # Error raised when encountering a syntax error while parsing a .env file.
  class FormatError < SyntaxError; end

  def self.parse_string(string)
    Dotenv::Parser.new(string).to_h
  end

  # Parses the `.env` file format into key/value pairs.
  # It allows for variable substitutions, command substitutions, and exporting of variables.
  class Parser
    LINE = /
      (?:^|\A)              # beginning of line
      \s*                   # leading whitespace
      (?:export\s+)?        # optional export
      ([\w.]+)              # key
      (?:\s*=\s*?|:\s+?)    # separator
      (                     # optional value begin
        \s*'(?:\\'|[^'])*'  #   single quoted value
        |                   #   or
        \s*"(?:\\"|[^"])*"  #   double quoted value
        |                   #   or
        [^\#\r\n]+          #   unquoted value
      )?                    # value end
      \s*                   # trailing whitespace
      (?:\#.*)?             # optional comment
      (?:$|\z)              # end of line
    /x

    def initialize(strings)
      @hash = {}
      # Convert line breaks to same format
      lines = strings.gsub(/\r\n?/, "\n")
      # Process matches
      lines.scan(LINE).each do |key, value|
        @hash[key] = parse_value(value || "")
      end
      # Process non-matches
      lines.gsub(LINE, "").split(/[\n\r]+/).each do |line|
        parse_line(line)
      end
      @hash
    end

    def to_h
        @hash
    end

    private

    def parse_line(line)
      if line.split.first == "export"
        if variable_not_set?(line)
          raise FormatError, "Line #{line.inspect} has an unset variable"
        end
      end
    end

    def parse_value(value)
      # Remove surrounding quotes
      value = value.strip.sub(/\A(['"])(.*)\1\z/m, '\2')
      maybe_quote = Regexp.last_match(1)
      value = unescape_value(value, maybe_quote)
    end

    def unescape_characters(value)
      value.gsub(/\\([^$])/, '\1')
    end

    def expand_newlines(value)
      if (@hash["DOTENV_LINEBREAK_MODE"] || ENV["DOTENV_LINEBREAK_MODE"]) == "legacy"
        value.gsub('\n', "\n").gsub('\r', "\r")
      else
        value.gsub('\n', "\\\\\\n").gsub('\r', "\\\\\\r")
      end
    end

    def variable_not_set?(line)
      !line.split[1..].all? { |var| @hash.member?(var) }
    end

    def unescape_value(value, maybe_quote)
      if maybe_quote == '"'
        unescape_characters(expand_newlines(value))
      elsif maybe_quote.nil?
        unescape_characters(value)
      else
        value
      end
    end

  end
end
