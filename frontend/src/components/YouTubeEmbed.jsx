function extractYouTubeId(input) {
  if (!input) return null;

  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }

  const match = input.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );

  return match ? match[1] : null;
}

const YouTubeEmbed = ({ videoId, title = "YouTube video" }) => {
  const id = extractYouTubeId(videoId);
  if (!id) return <p>Invalid YouTube URL or ID</p>;

  return (
    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      ></iframe>
    </div>
  );
};

export default YouTubeEmbed;
