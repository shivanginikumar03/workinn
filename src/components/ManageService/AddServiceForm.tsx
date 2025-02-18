'use client';
import { useTransition, useEffect, useState } from 'react';
import {
  Category,
  Service,
  ServiceCategory,
  ServiceInput,
  SubCategory,
} from '@/interfaces/service';
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import updateService from '@/actions/dashboard/updateService';
import addService from '@/actions/dashboard/addService';
import InputWithFieldError from '../Common/Form/InputWithFieldError';
import WYSIWYGEditor from '../Common/WYSIWYGEditor';
// @ts-ignore
import { stripHtml } from 'string-strip-html';
import Dropzone from './Dropzone';
import ModalConfirmButton from '../Common/ModalConfirmButton';
import ModalRejectButton from '../Common/ModalRejectButton';
import uploadImage from '@/utils/uploadFile';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { FileWithPath } from 'react-dropzone';
import SelectCategories from './SelectCategories';
import AddFaqs from './AddFaqs';
import AddTags from './AddTags';
import AddPrice from './AddPrice';

type Props = {
  service: Service | null;
  category: Category | null;
  subCategory: SubCategory | null;
  serviceCategory: ServiceCategory | null;
};

type ExtendedFile = FileWithPath & {
  preview: string;
};

const AddServiceForm = ({
  service,
  category,
  serviceCategory,
  subCategory,
}: Props) => {
  const methods = useForm<ServiceInput>();
  const {
    handleSubmit,
    formState: { errors },
    register,
    reset,
    control,
  } = methods;

  const { isConnected, address } = useAccount();
  const [loading, startTransaction] = useTransition();
  const [files, setFiles] = useState<ExtendedFile[]>([]);

  useEffect(() => {
    if (service) {
      reset(service);
      service.images.forEach((image, index) => {
        setFiles((prev) => [
          ...prev,
          {
            name: `image-${index + 1}`,
            preview: image,
          } as ExtendedFile,
        ]);
      });
    }
  }, [service, reset]);

  const onSubmit: SubmitHandler<ServiceInput> = async (data) => {
    const imagesUrl: string[] = [];
    const serviceId = service ? service.id : await addService(data);

    if (files.length > 0) {
      let imageIndex = 0;
      for (const image of files) {
        const imageUrl = await uploadImage(
          image,
          `/services/${serviceId}/images/image-${++imageIndex}`
        );
        imagesUrl.push(imageUrl);
      }
      data.images = imagesUrl;
    }

    try {
      await updateService(serviceId, data);
    } catch (error) {
      console.error('Error in updating service:', error);
    }

    handleReset();
  };

  const handleReset = () => {
    reset();
    setFiles([]);
  };

  return (
    <div className="bg-white rounded-xl p-8 h-full w-full">
      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold capitalize">
        Add a Service
      </h3>
      <div className="py-10">
        <FormProvider {...methods}>
          <form className="space-y-10" onSubmit={handleSubmit(onSubmit)}>
            <InputWithFieldError
              label="Name"
              errors={errors}
              name="name"
              labelClassName="text-lg font-medium text-gray-700"
            >
              <input
                type="text"
                className="form-input placeholder:gray-400"
                placeholder="I will do... (Ex: I will create a website for you)"
                {...register('name', {
                  required: 'Name is required',
                  maxLength: {
                    value: 100,
                    message: 'Name cannot be more than 100 characters',
                  },
                  minLength: {
                    value: 10,
                    message: 'Name cannot be less than 10 characters',
                  },
                })}
              />
            </InputWithFieldError>

            <Controller
              render={({ field }) => (
                <InputWithFieldError
                  label="Description"
                  errors={errors}
                  name="description"
                  labelClassName="text-lg font-medium text-gray-700"
                >
                  <WYSIWYGEditor
                    placeholder="Write description about your service...."
                    {...field}
                  />
                </InputWithFieldError>
              )}
              name="description"
              control={control}
              rules={{
                validate: {
                  required: (v) =>
                    (v && stripHtml(v).result.length > 0) ||
                    'Description is required',
                  maxLength: (v) =>
                    (v && stripHtml(v).result.length <= 2000) ||
                    'Maximum character limit is 2000',
                },
              }}
            />

            <InputWithFieldError
              label="Images"
              errors={errors}
              name="images"
              labelClassName="text-lg font-medium text-gray-700"
            >
              <Dropzone
                files={files}
                setFiles={setFiles}
                control={control}
                name="images"
              />
            </InputWithFieldError>

            <SelectCategories
              category={category}
              subCategory={subCategory}
              serviceCategory={serviceCategory}
            />

            <div className="space-y-4">
              <label className="ml-2 text-lg font-medium text-gray-700">
                Connect Wallet <span className="text-red-500 font-bold">*</span>
              </label>
              <ConnectButton />
            </div>

            <AddPrice />
            <AddFaqs />
            <AddTags />

            <div className="mt-4 flex items-center space-x-4">
              <ModalRejectButton
                onReject={handleReset}
                title="Reset"
                loading={loading}
              />

              <ModalConfirmButton
                onConfirm={() => startTransaction(handleSubmit(onSubmit))}
                title={
                  loading
                    ? service
                      ? 'Saving...'
                      : 'Adding...'
                    : service
                    ? 'Save'
                    : 'Add'
                }
                loading={loading}
              />
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default AddServiceForm;
