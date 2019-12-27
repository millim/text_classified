class Canvas

  @canvas_verifier_dir = Rails.root.join('canvas', 'verifier')
  @canvas_wait_verifier_dir = Rails.root.join('canvas', 'wait_verifier')

  @chars = ('a'..'z').to_a + ('0'..'9').to_a
  @chars_size = @chars.size - 1

  class << self
    def set_root_dir(*dir)
      @canvas_verifier_dir = Rails.root.join(*dir, 'verifier')
      @canvas_wait_verifier_dir = Rails.root.join(*dir, 'wait_verifier')
    end

    def mkdir(path)
      FileUtils.mkdir_p path
    end

    def dir_type(dir)
      dir = dir[0]
      dir = "lower-#{dir}" if dir >= 'a' && dir <= 'z'
      dir
    end

    def append_file(html_dir, file_type, bytes)
      dir = dir_type html_dir
      path = "#{@canvas_wait_verifier_dir}/#{dir}"
      mkdir(path) unless Dir.exists?(path)
      key = rand_file_name
      full_path = "#{path}/#{key}.#{file_type}"
      FileUtils.rm(full_path) if File.exists?(full_path)
      img_base64 = bytes["data:image/#{file_type};base64,".length..-1]
      File.open(full_path, 'wb') do |f|
        f.write Base64.decode64(img_base64)
      end
      "/#{html_dir}/#{key}"
    end

    def wait_url(dir, key, file_type)
      dir = dir_type dir
      "#{@canvas_wait_verifier_dir}/#{dir}/#{key}.#{file_type}"
    end


    def rand_file_name
      s = ''
      12.times{|i| s << @chars[rand(@chars_size)]}
      s
    end

  end
end
