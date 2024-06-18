require_relative './dotenv'

def read_config(dir, default_config={})
    file = File.join(dir, default_config['ENV_FILE'])
    read_config_file(file, default_config).merge({'SECRETS' => dir})
end

def read_config_file(file, default_config={})
    raise "File #{file} not found" unless File.exist?(file)
    content = File.read(file)
    read_config_string(content, default_config)
end

def read_config_string(string, default_config={})
    local_config = Dotenv::parse_string(string)
    default_config.merge(local_config)
end

