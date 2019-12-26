class Canvas < ApplicationRecord

  class << self

    CANVAS_DIR = Rails.root.join('canvas')


    def mkdir(path)
      FileUtils.mkdir path
    end

  end
end
