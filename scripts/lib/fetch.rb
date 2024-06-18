
def fetch_participants(config)
    file = File.join(config['SECRETS'], config['PARTICIPANTS_FILE'])
    raise "File #{file} not found" unless File.exist?(file)
    File.read(file).lines.map{ |line| line.gsub(/#.*/, '').strip }.reject(&:empty?)
end

def fetch_contacts(config)
    file = File.join(config['SECRETS'], config['CONTACTS_FILE'])
    raise "File #{file} not found" unless File.exist?(file)
    File.read(file).lines.map{ |line| line.gsub(/#.*/, '').strip }.reject(&:empty?)
end

def fetch_secret(config)
    file = File.join(config['SECRETS'], config['SECRET_FILE'])
    raise "File #{file} not found" unless File.exist?(file)
    File.read(file).strip
end

def fetch_encoded_data(config)
    file = File.join(config['SECRETS'], config['OUTPUT_DIR'], config['ENCODED_DATA_FILE'])
    raise "File #{file} not found" unless File.exist?(file)
    File.read(file)
end

def fetch_template(config)
    file = File.join(config['SECRETS'], config['TEMPLATE_FILE'])
    raise "File #{file} not found" unless File.exist?(file)
    File.read(file)
end

