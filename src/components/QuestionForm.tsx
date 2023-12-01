"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MESSAGE_ROLES } from "@/lib/constants";

export const chatCompletionMessageSchema = z.object({
  content: z.string().nullable(),
  role: z.enum([
    MESSAGE_ROLES.SYSTEM,
    MESSAGE_ROLES.ASSISTANT,
    MESSAGE_ROLES.USER,
  ]),
});

export type ChatCompletionMessage = z.infer<typeof chatCompletionMessageSchema>;

export const chatCompletionsSchema = z
  .object({
    question: z.string().trim().min(1, "Please ask a question to continue"),
    messages: chatCompletionMessageSchema
      .array()
      .min(1, "Messages cannot be empty"),
  })
  .strict();

export const questionFormSchema = chatCompletionsSchema
  .pick({ question: true })
  .strict();

export type QuestionFormSchema = z.infer<typeof questionFormSchema>;

type QuestionFormProps = {
  submitMessage: SubmitHandler<QuestionFormSchema>;
  isLoading: boolean;
};

export const QuestionForm = ({
  isLoading,
  // TODO: look into server actions
  submitMessage,
}: QuestionFormProps) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<QuestionFormSchema>({
    resolver: zodResolver(questionFormSchema),
  });

  const handleOnSubmit = handleSubmit((values) => {
    submitMessage(values);
    reset();
  });

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white bg-opacity-60 pb-8 pt-4 backdrop-blur-md dark:bg-black dark:bg-opacity-60 dark:text-white md:pb-16 md:pt-8">
      <form
        onSubmit={handleOnSubmit}
        className="relative mx-auto flex max-w-xl px-4"
      >
        <label className="sr-only" htmlFor="question">
          Ask a question
        </label>
        <input
          aria-required
          className="w-full appearance-none rounded-3xl border-2 bg-grey-light py-4 pl-4 pr-12 dark:border-white dark:bg-grey-dark"
          placeholder="Ask a question"
          type="text"
          id="question"
          disabled={isLoading}
          autoComplete="off"
          {...register("question")}
        />
        {errors.question?.message ? (
          <p className="absolute bottom-0 translate-y-full pt-2 text-xs text-pink">
            {errors.question.message}
          </p>
        ) : null}
        <button
          disabled={isLoading}
          aria-label="Submit question"
          type="submit"
          className="background absolute bottom-0 right-8 top-0"
        >
          <SendSvg />
        </button>
      </form>
    </div>
  );
};

const SendSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 20 20"
    width="1em"
    height="1em"
    fontSize="1.25rem"
  >
    <g
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      clipPath="url(#sendSvgClipPath)"
    >
      <path d="m18.33 1.67-9.16 9.16M18.33 1.67 12.5 18.33l-3.33-7.5-7.5-3.33 16.66-5.83Z" />
    </g>
    <defs>
      <clipPath id="sendSvgClipPath">
        <path fill="none" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
);
