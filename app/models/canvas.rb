class Canvas

  @canvas_verifier_dir = Rails.root.join('canvas', 'verifier')
  @canvas_wait_verifier_dir = Rails.root.join('canvas', 'wait_verifier')

  @chars = ('a'..'z').to_a + ('0'..'9').to_a
  @chars_size = @chars.size - 1

  class << self

    #  设置主目录
    def set_root_dir(*dir)
      @canvas_verifier_dir = Rails.root.join(*dir, 'verifier')
      @canvas_wait_verifier_dir = Rails.root.join(*dir, 'wait_verifier')
    end

    # 创建目录
    def mkdir(path)
      FileUtils.mkdir_p path
    end

    # 目录显示的时候区分大小写，但是创建时不区分，因此对小写字母的文件夹做扩展处理
    def dir_type(dir)
      dir = dir[0]
      dir = "lower-#{dir}" if dir >= 'a' && dir <= 'z'
      dir
    end

    # 上传文件到待验证目录
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
      "#{@canvas_wait_verifier_dir}/#{dir}/#{key}.#{file_type}"
    end

    def official_url(dir, key, file_type)
      "#{@canvas_verifier_dir}/#{dir}/#{key}.#{file_type}"
    end


    def rand_file_name
      s = ''
      12.times{|i| s << @chars[rand(@chars_size)]}
      s
    end

    def wait_dir
      dirs = Dir.glob("#{@canvas_wait_verifier_dir}/*").select{|f| File.directory? f}.map{|f| File.basename f}
      dirs.map{|d| {id: d, text: d.include?('lower-') ? d.split('-')[1] : d}}
    end

    def image_list(dir)
      Dir.glob("#{@canvas_wait_verifier_dir}/#{dir}/*").select{|f| File.file? f}.map{|f| File.basename(f, '.png')}
    end

    def remove_wait_verifier_images(dir, file_name_arr)
      remove_images("#{@canvas_wait_verifier_dir}/#{dir}", file_name_arr)
    end

    def remove_images(full_dir, file_name_arr)
      ff = file_name_arr.map{|file_name| "#{full_dir}/#{file_name}.png"}
      FileUtils.rm ff,force: true
    end


    def delete_wait_verifier_files(dir, file_name_arr)
      file_name_arr.each do |file_name|
        full_path = wait_url dir, file_name , 'png'
        FileUtils.rm(full_path) if File.exists?(full_path)
      end
    end

    def success_wait_all(dir)
      files_name_arr = image_list(dir)
      success_wait_verifier_files dir, files_name_arr
    end

    def success_wait_verifier_files(dir, file_name_arr)
      path = "#{@canvas_verifier_dir}/#{dir}"
      mkdir(path) unless Dir.exists?(path)
      file_name_arr.each do |file_name|
        full_path = wait_url dir, file_name , 'png'
        to_path = official_url dir, file_name, 'png'
        FileUtils.mv(full_path, to_path) if File.exists?(full_path)
      end
    end

  end
end
