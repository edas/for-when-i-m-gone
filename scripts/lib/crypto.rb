require 'securerandom'
require 'open3'
require 'tempfile'

def create_passphrase(config)
    SecureRandom.base64(config['BYTES'])
    # or `openssl rand -base64 #{BYTES}`
end

def encode_secret(passphrase, config)
    secrets = File.join(config['SECRETS'], config['SECRET_FILE'])
    data = File.join(config['SECRETS'], config['OUTPUT_DIR'], config['ENCODED_DATA_FILE'])
    raise "File #{secrets} not found" unless File.exist?(secrets)
    cipher = "-#{config['CIPHER']}"
    deriv = "-#{config['DERIV']} -iter #{config['ITER']} -md #{config['DIGEST']}"
    salt = "-salt -saltlen #{config['SALT']}"
    source = "-in #{secrets} -out #{data}"
    pass = "-pass stdin"
    cmd = "openssl enc #{cipher} -a #{pass} #{deriv} #{salt} #{source}"
    err = Open3.popen3(cmd) do |stdin, stdout, stderr, thr|
        stdin.write(passphrase)
        stdin.close
        stdout.read
        stderr.read
    end
    status = $?
    raise "openssl encryption failed with '#{err}'" unless status.success?
end

def split_secret(passphrase, config, threshold, shares)
    cmd = "ssss-split -q -t #{threshold} -n #{shares}"
    output = ""
    err = Open3.popen3(cmd) do |stdin, stdout, stderr, thr|
        stdin.write(passphrase)
        stdin.close
        output = stdout.read
        stderr.read
    end
    status = $?
    raise "ssss-split failed with '#{err}'" unless status.success?
    output.lines.map(&:strip).reject(&:empty?)
end

def recover_secret(tokens, threshold)
    cmd = "ssss-combine -t #{threshold} -q"
    err = Open3.popen3(cmd) do |stdin, stdout, stderr, thr|
        stdin.write(tokens.join("\n"))
        stdin.close
        stderr.read
    end
    status = $?
    raise "ssss-combine failed with '#{err}'" unless status.success?
    err
end

def decode_secret(passphrase, data, config)
    output = ""
    Tempfile.create('encoded-data') do | file|
        file.write(data)
        file.flush
        cipher = "-#{config['CIPHER']}"
        deriv = "-#{config['DERIV']} -iter #{config['ITER']} -md #{config['DIGEST']}"
        salt = "-salt -saltlen #{config['SALT']}"
        source = "-in #{file.path}"
        pass = "-pass stdin"
        cmd = "openssl enc -d #{cipher} -a #{pass} #{deriv} #{salt} #{source}"
        err = Open3.popen3(cmd) do |stdin, stdout, stderr, thr|
            stdin.write(passphrase)
            stdin.close
            output = stdout.read
            stderr.read
        end
        status = $?
        raise "openssl encryption failed with '#{err}'" unless status.success?
    end
    return output
end