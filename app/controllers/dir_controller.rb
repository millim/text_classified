class DirController < ApplicationController
  def index
    @dirs = Canvas.wait_dir
  end

  def show
    @id = params[:id]
    @files = Canvas.image_list params[:id]
  end

  def delete
    files = params[:id].split(",")

  end
end
