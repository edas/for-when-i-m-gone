#!/usr/bin/env ruby
require 'pp'
require 'fileutils'
require_relative 'lib/config'
require_relative 'lib/fetch'
require_relative 'lib/crypto'
require_relative 'lib/template'

# Read config
default_config = {
    'VERSION' => '1',
    'BYTES' => 16,
    'CIPHER' => 'aes-256-cbc',
    'DIGEST' => 'SHA3-256',
    'DERIV' => 'pbkdf2',
    'ITER' => 123456789,
    'SALT' => 16,
    'PARTICIPANTS_FILE' => 'participants.txt',
    'CONTACTS_FILE' => 'contacts.txt',
    'TEMPLATE_FILE' => 'template.html',
    'OUTPUT_DIR' => 'dist',
    'OUTPUT_FILE' => 'testament.html',
    'ENCODED_DATA_FILE' => 'encoded.txt',
    'SECRET_FILE' => 'secrets.txt',
    'ENV_FILE' => 'params.env',
    'SECRETS' => './secrets',
    'NAME' => '',
}
dir = ARGV[0] || ENV['SECRETS'] || default_config['SECRETS']
CONFIG = read_config(dir, default_config)

# Reset destination
output = File.join(CONFIG['SECRETS'], CONFIG['OUTPUT_DIR'])
FileUtils.rm_rf(output) if File.exist?(output)
FileUtils.mkdir_p(output)

# Participants
PARTICIPANTS = fetch_participants(CONFIG)
SHARES = (CONFIG['SHARES'] || PARTICIPANTS.size).to_i
THRESHOLD = (ARGV[1] || CONFIG['THRESHOLD'] || SHARES).to_i

# Master key
PASS = create_passphrase(CONFIG)

# Encode the secrets with the key
encode_secret(PASS, CONFIG)

# Split the key and get personal tokens
TOKENS = split_secret(PASS, CONFIG, THRESHOLD, SHARES)

# Generate final files
generate_files(TOKENS, PARTICIPANTS, THRESHOLD, CONFIG)
