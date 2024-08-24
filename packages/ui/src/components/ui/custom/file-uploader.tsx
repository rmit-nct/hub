'use client';

import { cn, formatBytes } from '../../../../../../apps/web/src/lib/utils';
import { useControllableState } from '../../../hooks/use-controllable-state';
import { Button } from '../button';
import { ScrollArea } from '../scroll-area';
import { Separator } from '../separator';
import { Cross2Icon, FileTextIcon, UploadIcon } from '@radix-ui/react-icons';
import { HTMLAttributes, useCallback, useEffect, useState } from 'react';
import Dropzone, {
  type DropzoneProps,
  type FileRejection,
} from 'react-dropzone';
import { toast } from 'sonner';

interface FileUploaderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Value of the uploader.
   * @type File[]
   * @default undefined
   * @example value={files}
   */
  value?: File[];

  /**
   * Function to be called when the value changes.
   * @type (files: File[]) => void
   * @default undefined
   * @example onValueChange={(files) => setFiles(files)}
   */
  // eslint-disable-next-line no-unused-vars
  onValueChange?: (files: File[]) => void;

  /**
   * Function to be called when files are uploaded.
   * @type (files: File[]) => Promise<void>
   * @default undefined
   * @example onUpload={(files) => uploadFiles(files)}
   */
  // eslint-disable-next-line no-unused-vars
  onUpload?: (files: File[]) => Promise<void>;

  /**
   * Progress of the uploaded files.
   * @type Record<string, 'uploading' | 'uploaded' | 'error'> | undefined
   * @default undefined
   * @example progresses={{ "file1.png": 'uploading', "file2.png": 'uploaded' }}
   */
  progresses?: Record<string, 'uploading' | 'uploaded' | 'error'>;

  /**
   * Accepted file types for the uploader.
   * @type { [key: string]: string[]}
   * @default
   * ```ts
   * { "image/*": [] }
   * ```
   * @example accept={["image/png", "image/jpeg"]}
   */
  accept?: DropzoneProps['accept'];

  /**
   * Maximum file size for the uploader.
   * @type number | undefined
   * @default 1024 * 1024 * 2 // 2MB
   * @example maxSize={1024 * 1024 * 2} // 2MB
   */
  maxSize?: DropzoneProps['maxSize'];

  /**
   * Maximum number of files for the uploader.
   * @type number | undefined
   * @default 1
   * @example maxFileCount={4}
   */
  maxFileCount?: DropzoneProps['maxFiles'];

  /**
   * Whether the uploader should accept multiple files.
   * @type boolean
   * @default false
   * @example multiple
   */
  multiple?: boolean;

  /**
   * Whether the uploader is disabled.
   * @type boolean
   * @default false
   * @example disabled
   */
  disabled?: boolean;
}

export function FileUploader(props: FileUploaderProps) {
  const {
    value: valueProp,
    onValueChange,
    onUpload,
    progresses,
    accept = {
      'application/pdf': [],
      'image/*': [],
    },
    maxSize = 1024 * 1024 * 2,
    maxFileCount = 1,
    multiple = false,
    disabled = false,
    className,
    ...dropzoneProps
  } = props;

  const [files, setFiles] = useControllableState({
    prop: valueProp,
    onChange: onValueChange,
  });

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (!multiple && maxFileCount === 1 && acceptedFiles.length > 1) {
        toast.error('Cannot upload more than 1 file at a time');
        return;
      }

      if ((files?.length ?? 0) + acceptedFiles.length > maxFileCount) {
        toast.error(`Cannot upload more than ${maxFileCount} files`);
        return;
      }

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      const updatedFiles = files ? [...files, ...newFiles] : newFiles;

      setFiles(updatedFiles);

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file }) => {
          toast.error(`File ${file.name} was rejected`);
        });
      }

      // if (
      //   onUpload &&
      //   updatedFiles.length > 0 &&
      //   updatedFiles.length <= maxFileCount
      // ) {
      //   const target =
      //     updatedFiles.length > 0 ? `${updatedFiles.length} files` : `file`;

      //   toast.promise(onUpload(updatedFiles), {
      //     loading: `Uploading ${target}...`,
      //     success: () => {
      //       setFiles([]);
      //       return `${target} uploaded`;
      //     },
      //     error: `Failed to upload ${target}`,
      //   });
      // }
    },

    [files, maxFileCount, multiple, onUpload, setFiles]
  );

  function onRemove(index: number) {
    if (!files) return;
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onValueChange?.(newFiles);
  }

  // Revoke preview url when component unmounts
  useEffect(() => {
    return () => {
      if (!files) return;
      files.forEach((file) => {
        if (isFileWithPreview(file)) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, []);

  const isDisabled = disabled || (files?.length ?? 0) >= maxFileCount;

  const [loading, setLoading] = useState(false);

  const [fileStatuses, setFileStatuses] = useState<Record<string, string>>({});

  async function onSubmit() {
    if (loading || !files || !files.length) return;
    setLoading(true);
    await onUpload?.(files);
    setLoading(false);
  }

  return (
    <div className="relative flex flex-col overflow-hidden">
      <Dropzone
        onDrop={onDrop}
        accept={accept}
        maxSize={maxSize}
        maxFiles={maxFileCount}
        multiple={maxFileCount > 1 || multiple}
        disabled={isDisabled}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div
            {...getRootProps()}
            className={cn(
              'border-muted-foreground/25 hover:bg-muted/25 group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed px-6 py-2 text-center transition',
              'ring-offset-background focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              isDragActive && 'border-muted-foreground/50',
              isDisabled && 'pointer-events-none opacity-60',
              className
            )}
            {...dropzoneProps}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                <div className="rounded-full border border-dashed p-3">
                  <UploadIcon
                    className="text-muted-foreground size-7"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-muted-foreground font-medium">
                  Drop the files here
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                <div className="rounded-full border border-dashed p-3">
                  <UploadIcon
                    className="text-muted-foreground size-7"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex flex-col gap-px">
                  <p className="text-muted-foreground font-medium">
                    Drag {`'n'`} drop files here, or click to select files
                  </p>
                  <p className="text-muted-foreground/70 text-sm">
                    You can upload
                    {maxFileCount > 1
                      ? ` ${maxFileCount === Infinity ? 'multiple' : maxFileCount}
                      files (up to ${formatBytes(maxSize)} each)`
                      : ` a file with ${formatBytes(maxSize)}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Dropzone>

      {files?.length ? (
        <ScrollArea className="h-fit w-full p-2 px-3">
          <div className="flex max-h-48 flex-col gap-1 py-4">
            {files?.map((file, index) => (
              <FileCard
                key={index}
                file={file}
                onRemove={() => onRemove(index)}
                progress={progresses?.[file.name]}
              />
            ))}
          </div>
        </ScrollArea>
      ) : null}

      <Separator className={files?.length ? 'mb-4' : 'my-4'} />

      <div className="flex gap-2">
        <Button
          type="button"
          className="w-fit"
          onClick={() => {
            setFileStatuses({});
            setFiles([]);
          }}
          variant="ghost"
          disabled={
            loading ||
            !files ||
            files?.length === 0 ||
            // at least one file is uploaded
            (files.length > 0 &&
              // all files match the uploaded status
              files.every((file) => fileStatuses[file.name] === 'uploaded'))
          }
        >
          {/* {t('storage-object-data-table.clear_files')} */}
          Clear Files
        </Button>
        <Button
          type="button"
          className="w-full"
          onClick={onSubmit}
          disabled={
            loading ||
            !files ||
            files?.length === 0 ||
            // at least one file is uploaded
            (files.length > 0 &&
              // all files match the uploaded status
              files.every((file) => fileStatuses[file.name] === 'uploaded'))
          }
        >
          {/* {loading ? t('common.processing') : submitLabel} */}
          Upload Files
        </Button>
      </div>
    </div>
  );
}

interface FileCardProps {
  file: File;
  onRemove: () => void;
  progress?: 'uploading' | 'uploaded' | 'error';
}

function FileCard({ file, progress, onRemove }: FileCardProps) {
  return (
    <div className="hover:bg-foreground/5 relative flex items-center gap-2 rounded-md p-2">
      <div className="flex flex-1 gap-2">
        {isFileWithPreview(file) ? (
          <div className="aspect-square size-10 flex-none">
            <FilePreview file={file} />
          </div>
        ) : null}
        <div className="flex w-full flex-col items-start gap-2 text-start">
          <div className="flex flex-col gap-px">
            <p className="text-foreground/80 line-clamp-1 text-sm font-semibold">
              {file.name}
            </p>
            <div className="text-muted-foreground text-xs font-semibold">
              {progress === 'uploading' ? (
                <span className="opacity-70">Uploading...</span>
              ) : progress === 'uploaded' ? (
                <span>Uploaded</span>
              ) : progress === 'error' ? (
                <span className="text-destructive">Error</span>
              ) : (
                <span> {formatBytes(file.size)}</span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-7"
          onClick={onRemove}
        >
          <Cross2Icon className="size-4" aria-hidden="true" />
          <span className="sr-only">Remove file</span>
        </Button>
      </div>
    </div>
  );
}

function isFileWithPreview(file: File): file is File & { preview: string } {
  return 'preview' in file && typeof file.preview === 'string';
}

interface FilePreviewProps {
  file: File & { preview: string };
}

function FilePreview({ file }: FilePreviewProps) {
  if (file.type.startsWith('image/')) {
    return (
      <img
        src={file.preview}
        alt={file.name}
        width={48}
        height={48}
        loading="lazy"
        className="rounded-md object-cover"
      />
    );
  }

  return (
    <FileTextIcon
      className="text-muted-foreground size-10"
      aria-hidden="true"
    />
  );
}