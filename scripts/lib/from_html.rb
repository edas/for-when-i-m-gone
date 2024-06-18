
def extract_data(keys, string)
    keys.map { |key|
        [key, /<pre id="#{key}">(.*?)<\/pre>/m.match(string)[1]]
    }.to_h
end


def extract_file_content(file) 
    keys = ['token', 'enc-data', 'params']
    data = extract_data(keys, file)
    data['params'] = read_config_string(data['params'])
    return data
end

def extract_files_content(contents)
    data = contents.map { |content| extract_file_content(content) }
    return {
        'TOKENS' => data.map { |d| d['token'] },
        'DATA' => data[0]['enc-data'],
        'PARAMS' => data[0]['params'],
    }
end

def extract_files(files)
    contents = files.map { |file| File.read(file) }
    extract_files_content(contents)
end
