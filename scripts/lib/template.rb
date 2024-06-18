require 'erb'
require 'ostruct'

def replace(tpl, values) 
    ERB.new(tpl).result(OpenStruct.new(values.transform_keys(&:downcase)).instance_eval { binding })
end

def write_file(file, content)
    dir = File.dirname(file) 
    FileUtils.mkdir_p(dir) unless dir.empty?
    File.write(file, content)
end

def generate_files(tokens, participants, threshold, config)
    contacts = fetch_contacts(config)
    data = fetch_encoded_data(config)
    tpl = fetch_template(config)
    output = File.join(config['SECRETS'], config['OUTPUT_DIR'])
    params = {
        'VERSION' => config['VERSION'],
        'CIPHER' => config['CIPHER'],
        'DERIV' => config['DERIV'],
        'ITER' => config['ITER'],
        'DIGEST' => config['DIGEST'],
        'SALT' => config['SALT'],
        'THRESHOLD' => threshold,
    }.map { |key,value| "#{key}=#{value}" }.join("\n")
    env = File.join(output, config['ENV_FILE'])
    File.write(env, params)
    date = Time.now.strftime("%Y-%m-%d")
    TOKENS.map.with_index do |token, i|
        values = config.merge({
            'DATE' => date,
            'PARAMS' => params,
            'DATA' => data,
            'CONTACTS' => contacts,
            'TOKEN' => token,
            'PARTICIPANTS' => participants,
            'THRESHOLD' => threshold,
        })
        content = replace(tpl, values)
        file = File.join(output, i.to_s, config['OUTPUT_FILE'])
        write_file(file, content)
    end
end
