
require 'test_helper'

class CanvasTest < ActiveSupport::TestCase
  CANVAS_DIR = Rails.root.join('test','canvas')

  def setup
    Canvas.set_root_dir 'test', 'canvas'
    FileUtils.rm_rf CANVAS_DIR
  end

  test "测试目录县相关" do
    Canvas.mkdir CANVAS_DIR
    assert Dir.exists?(CANVAS_DIR)

    Canvas.append_file('lb', 'txt', 'ccc')
  end

end