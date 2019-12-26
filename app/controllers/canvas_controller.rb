class CanvasController < ApplicationController

  skip_before_action :verify_authenticity_token, only: :create

  def create
    puts params[:bind_text]
    params[:image_bytes]
  end

end
