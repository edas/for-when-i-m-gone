#!/usr/bin/env ruby
require 'pp'
require 'fileutils'
require_relative 'lib/config'
require_relative 'lib/fetch'
require_relative 'lib/crypto'
require_relative 'lib/template'
require_relative 'lib/from_html'

# Read config
default_config = {
    'OUTPUT_DIR' => 'dist',
    'OUTPUT_FILE' => 'testament.html',
    'SECRETS' => './secrets',
}

search_pattern = File.join(default_config['SECRETS'], default_config['OUTPUT_DIR'], "**", "*#{File.extname(default_config['OUTPUT_FILE'])}")
files = Dir.glob(search_pattern)

data = extract_files(files)
TOKENS = data['TOKENS']
PARAMS = data['PARAMS']
DATA = data['DATA']
THRESHOLD = PARAMS['THRESHOLD']

PASS = recover_secret(TOKENS, THRESHOLD)

puts decode_secret(PASS, DATA, PARAMS)


