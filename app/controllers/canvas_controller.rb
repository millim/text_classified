class CanvasController < ApplicationController

  skip_before_action :verify_authenticity_token, only: :create

  def create
    path_key = Canvas.append_file params[:bind_text], 'png', params[:image_bytes]
    render json: {
        path_key: path_key
    }
  end

  def image
    file_url = Canvas.wait_url params[:type], params[:key], 'png'
    if File.exists? file_url
      data = File.new(file_url, 'rb').read
      send_data(data, filename: params[:key],
                type: 'image/png', disposition: "inline")
    else
      head :no_content
      render nothing: true, status: 204 && return
    end

  end

end
