export async function createBandi(req, connection) {
  const { user, body, files } = req;

  const photoPath = extractPhoto(files);
  const muddas = extractMuddaData(body, files);

  const bandiId = await bandiRepo.insertBandiPerson(
    { ...body, photo_path: photoPath },
    user,
    connection
  );

  await bandiRepo.insertKaidDetails(bandiId, body, user, connection);
  await bandiRepo.insertAddress(bandiId, body, user, connection);
  await bandiRepo.insertMuddaDetails(bandiId, muddas, user, connection);

  return bandiId;
}
