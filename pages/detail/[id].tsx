import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { MdOutlineCancel } from "react-icons/md";
import { GoVerified } from "react-icons/go";
import { BsFillPlayFill } from "react-icons/bs";
import { HiVolumeOff, HiVolumeUp } from "react-icons/hi";
import axios from "axios";
import { BASE_URL } from "../../utils";
import { Video } from "../../types";
import useAuthStore from "../../store/authStore";
import LikeButton from "../../components/LikeButton";
import Comments from "../../components/Comments";

interface IProps {
  postDetails: Video;
}

const Detail = ({ postDetails }: IProps) => {
  const [post, setPost] = useState(postDetails);
  const [playing, setPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [comment, setComment] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);

  const { userProfile }: any = useAuthStore();

  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement>(null);

  const onVideoClick = () => {
    if (playing) {
      videoRef?.current?.pause();
      setPlaying(false);
    } else {
      videoRef?.current?.play();
      setPlaying(true);
    }
  };

  const handleToggleMute = () => {
    setIsVideoMuted((prevState) => !prevState); // Toggle the mute state
  };

  useEffect(() => {
    if (post && videoRef?.current) {
      videoRef.current.muted = isVideoMuted;
    }
  }, [post, isVideoMuted]);

  const handleLike = async (like: boolean) => {
    if (userProfile) {
      const { data } = await axios.put(`${BASE_URL}/api/like`, {
        userId: userProfile._id,
        postId: post._id,
        like,
      });
      setPost({ ...post, likes: data.likes });
      // console.log(post)
    }
  };

  const addComment = async (e: any) => {
    e.preventDefault();

    if (userProfile && comment) {
      setIsPostingComment(true);

      const { data } = await axios.put(`${BASE_URL}/api/post/${post._id}`, {
        userId: userProfile._id,
        comment,
      });

      setPost({ ...post, comments: data.comments });
      console.log(post);
      setComment("");

      setIsPostingComment(false);
    }
  };

  if (!post) return null;

  return (
    <div className="flex w-full absolute left-0 top-0 bg-white flex-wrap lg:flex-nowrap">
      <div className="relative flex-2 w-[1000px] lg:w-9/12 flex justify-center items-center bg-black">
        <div className="opacity-90 absolute top-6 left-2 lg:left-6 flex gap-6 z-50">
          <p className="cursor-pointer " onClick={() => router.back()}>
            <MdOutlineCancel className="text-white text-[35px] hover:opacity-90" />
          </p>
        </div>
        <div className="relative">
          <div className="lg:h-[100vh] h-[60vh]">
            <video
              ref={videoRef}
              onClick={onVideoClick}
              loop
              src={post?.video?.asset.url}
              className=" h-full cursor-pointer"
            ></video>
          </div>
          <div className="absolute top-[45%] left-[40%]  cursor-pointer">
            {!playing && (
              <button onClick={onVideoClick}>
                <BsFillPlayFill className="text-white text-6xl lg:text-8xl" />
              </button>
            )}
          </div>
        </div>

        <div className="absolute bottom-5 lg:bottom-10 right-5 lg:right-10  cursor-pointer">
          {isVideoMuted ? (
            <button onClick={handleToggleMute}>
              <HiVolumeOff className="text-white text-3xl lg:text-4xl" />
            </button>
          ) : (
            <button onClick={handleToggleMute}>
              <HiVolumeUp className="text-white text-3xl lg:text-4xl" />
            </button>
          )}
        </div>
      </div>

      <div className="relative w-[1000px] md:w-[900px lg;w-[700px]">
        <div className="lg:mt-20 mt-10">
          <div className="flex gap-3 p-2 cursor-pointer font-semibold rounded">
            <div className="ml-4 md:h-20 md:w-20 w-16 h-16">
              <Link href="/">
                <>
                  <Image
                    height={62}
                    width={62}
                    src={post.postedBy.image}
                    layout="responsive"
                    alt="profile photo"
                    className="rounded-full"
                  />
                </>
              </Link>
            </div>
            <div>
              <Link href="/">
                <div className="mt-3 flex flex-col  gap-2">
                  <p className="flex  items-center gap-2 md:text-md font-bold text-primary capitalize">
                    {post.postedBy.userName}
                    <GoVerified className="text-blue-400 text-md" />
                  </p>

                  <p className="capitalize text-gray-400 hidden md:block text-xs">
                    {post.postedBy.userName}
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <p className="px-10 text-md text-gray-600">{post.caption}</p>

          <div className="mt-10 px-10">
            {userProfile && (
              <LikeButton
                likes={post.likes}
                handleLike={() => handleLike(true)}
                handleDislike={() => handleLike(false)}
              />
            )}
          </div>
          <Comments
            comment={comment}
            setComment={setComment}
            isPostingComment={isPostingComment}
            comments={post.comments}
            addComment={addComment}
          />
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { data } = await axios.get(`${BASE_URL}/api/post/${id}`);

  return {
    props: { postDetails: data },
  };
};

export default Detail;
